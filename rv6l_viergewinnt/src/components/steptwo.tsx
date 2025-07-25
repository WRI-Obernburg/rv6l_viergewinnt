import { Text, View, Button, useEventHandler, BoxView } from "@nodegui/react-nodegui";
import { Direction, QPushButtonSignals } from "@nodegui/nodegui";
import React from "react";
import open from "open";
import { moveToBlue, moveToColumn, moveToRed, toggleGripper } from "../rv6l_client";

export function StepTwo() {
  const btnGripperOn = useEventHandler<QPushButtonSignals>(
    {
      clicked: () => {toggleGripper(true)}
    },
    []
  );
  const btnGripperOff = useEventHandler<QPushButtonSignals>(
    {
      clicked: () => {toggleGripper(false)}
    },
    []
  );

  const btnRed = useEventHandler<QPushButtonSignals>(
    {
      clicked: () => {moveToRed()}
    },
    []
  );
  const btnBlue = useEventHandler<QPushButtonSignals>(
    {
      clicked: () => {moveToBlue()}
    },
    []
  );

  const btnColumnOne = useEventHandler<QPushButtonSignals>(
    {
      clicked: () => {moveToColumn(1)}
    },
    []
  );
  return (
    <View style={containerStyle}>
      <Text style={textStyle} wordWrap={true}>
        {`
         <p>Click to buttons to perform the action</p>
        `}
      </Text >
        <View style={buttonViewStyle}>
        <Button
          text="Move to Red"
          on={btnRed}
          style={btnStyle}
        />
        <Button
          text="Move to Blue"
          on={btnBlue}
          style={btnStyle}
        />
        <Button
          text="Move to Column 1"
          on={btnColumnOne}
          style={btnStyle}
        />
        <Button
          text="Gripper On"
          on={btnGripperOn}
          style={btnStyle}
        />
        <Button
          text="Gripper Off"
          on={btnGripperOff}
          style={btnStyle}
        />
        </View>
    </View>
  );
}

const containerStyle = `
  flex: 1;
`;

const textStyle = `
  padding-right: 20px;
`;

const buttonViewStyle = `
  display: flex;
  flex-direction: row;
  justify-content: 'center';
`;

const btnStyle = `
  height: 40px;
  padding: 5px;
  margin-right: 10px;
`;
