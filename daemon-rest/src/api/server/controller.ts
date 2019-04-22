import ServerResolver from './resolver';
import CrudController from '../../common/crud-controller';

export default class ServerController extends CrudController<Number> {
  constructor() {
    super(new ServerResolver());
  }
}
