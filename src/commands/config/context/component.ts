import { FunctionComponent } from 'react';
import { ContextService } from '../../../config/context';
import { inject, injectable } from 'tsyringe';
import {ContextMessageWriter, IContextMessageWriter} from './messages';

@injectable()
export class ContextComponent {
  constructor(
    private contextService: ContextService,
    @inject(ContextMessageWriter) private messageWriter: IContextMessageWriter
  ) {
  }
  list: FunctionComponent = () => {
    return this.messageWriter.list({store: this.contextService.context?.store});
  }
}
