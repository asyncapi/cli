import { ProblemMixin } from '@asyncapi/problem';

export interface ProblemExceptionProps {
  status: number;
  [key: string]: any;
}

const typePrefix = 'https://api.asyncapi.com/problem';

export class ProblemException extends ProblemMixin<ProblemExceptionProps>({ typePrefix }) {}
