import * as net from 'net';
import { XMLParser } from 'fast-xml-parser';
import * as stream from 'stream';

var client = new net.Socket();
const parser = new XMLParser();
const incommingStream = new stream.PassThrough();
let globalMessageCounter = 0;
export function initClient() {
	client.connect(80, '192.168.2.1',async function () {
		console.log('Connected');
	
		// START SESSION	const getVariable = "<RSVCMD><clientStamp>123</clientStamp><symbolApi><readSymbolValue><name>IMOVE</name><prog>S:/PROG/4GEWINNT/4GEWINNT</prog></readSymbolValue></symbolApi></RSVCMD>"
		// SEND COMMAND
		const startSessionCommand = 'SYMTABLE_SESSION / \n';
		client.write(startSessionCommand);
	
		await initSymTable()
	
		/*await moveToBlue();
		await moveToColumn(1);
	
		await moveToRed();
		await moveToColumn(1)*/
	

	});
	
	client.on('data', function (data) {
		//console.log('Received: ' + data);
	
		//seperate data string after </RSVRES> and process each
		const dataString = data.toString();
		const messages = dataString.split('</RSVRES>');
		messages.forEach((message) => {
			if (message.trim()) { // Check if the message is not empty
				const completeMessage = message + '</RSVRES>';
				const jsonObj = parser.parse(completeMessage);
				incommingStream.write(JSON.stringify(jsonObj)); // Write the complete message to the stream
			}
		});
		
	});
	
	client.on('close', function () {
		console.log('Connection closed');
	});
}


export async function moveToBlue() {

	console.log("Moving to blue");

	await writeVariableInProc("IMOVE", "1");
	await movementDone();
}

export async function moveToRed() {

	console.log("Moving to red");

	await writeVariableInProc("IMOVE", "2");
	await movementDone();
}

export async function moveToColumn(column:number) {

	if(column != 1) {
		throw new Error("Only column 1 is supported at the moment");
	}

	//if(column < 0 || column > 6) {
	//	throw new Error("Column must be between 0 and 6");
	//}

	console.log("Moving to column " + column);

	await writeVariableInProc("IMOVE", (11+column).toString());
	await movementDone();
}

async function movementDone() {
	await waitForVariablePolling("IMOVE", "0");
}

async function waitForVariablePolling(variable:string, value:string) {
	let startTime = Date.now();

	return new Promise((resolve, reject) => {
		const id = setInterval(async () => {
			const currentValue = await readVariableInProc(variable);
			if(currentValue.toString() === value) {
				clearInterval(id);
				resolve(true);
				let deltaTime = Date.now() - startTime;
				process.stdout.write(` done Took ${deltaTime}ms\n`);
			}else{
				process.stdout.write(".")
			}
		}, 200);
	});
}

async function readVariableInProc(name: string): Promise<string> {
	let messageId = getNextMessageId();
	const getVariable = `<RSVCMD><clientStamp>${messageId}</clientStamp><symbolApi><readSymbolValue><name>IMOVE</name><prog>S:/PROG/4GEWINNT/4GEWINNT</prog></readSymbolValue></symbolApi></RSVCMD>`
	client.write(getVariable);

	const result = await waitForMessage(messageId);

	return result.RSVRES.symbolApi.readSymbolValue.value;
}

async function initSymTable() {
	let messageId = getNextMessageId();
	const initSymbolsCommand = `<RSVCMD><clientStamp>${messageId}</clientStamp><symbolApi><initSymbolTable/></symbolApi></RSVCMD>`;
	client.write(initSymbolsCommand);

	await waitForMessage(messageId); // Wait for the response to ensure the write was successful

}


async function writeVariableInProc(name: string, value: string) {
	let messageId = getNextMessageId();
	const setVariable = `<RSVCMD><clientStamp>${messageId}</clientStamp><symbolApi><writeSymbolValue><name>${name}</name><prog>S:/PROG/4GEWINNT/4GEWINNT</prog><value>${value}</value></writeSymbolValue></symbolApi></RSVCMD>`;
	client.write(setVariable);

	await waitForMessage(messageId); // Wait for the response to ensure the write was successful

}

export async function toggleGripper(on: boolean) {
	let messageId = getNextMessageId();
	const setVariable = `<RSVCMD><clientStamp>${messageId}</clientStamp><symbolApi><writeSymbolValue><name>_IBIN_OUT[6]</name><value>${on?"1":"0"}</value></writeSymbolValue></symbolApi></RSVCMD>`;
	client.write(setVariable);

	await waitForMessage(messageId); // Wait for the response to ensure the write was successful

}

async function waitForMessage(id: number):Promise<any> {
	return new Promise((resolve, reject) => {
		const onDataCallback = (data: any) => {
			const jsonObj = JSON.parse(data.toString());
			if(jsonObj.RSVRES.clientStamp !== id) {
				return; // Ignore messages with different clientStamp
			}
			resolve(jsonObj);
			incommingStream.off('data', onDataCallback); // Remove the listener after resolving
		};
		incommingStream.on('data', onDataCallback);
	});
}

function getNextMessageId(): number {
	if(globalMessageCounter >= 1000) {
		globalMessageCounter = 0;
	}
	return globalMessageCounter++;
}