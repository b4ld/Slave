import Resolver from '../../common/base-resolver';
import Repository from '../../common/base-repository';

export default class ServerResolver extends Resolver<Number> {
  constructor() {
    super(new Repository());
  }
}
