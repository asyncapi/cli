import React, { FC } from 'react';
import { Text } from 'ink';
import { HelpMessage } from "../../CliModels";

interface HelpInput {
	message: HelpMessage,
}

const Help: FC<HelpInput> = ({ message }) => (
	<Text>{message}</Text>
);

module.exports = Help;
export default Help;
