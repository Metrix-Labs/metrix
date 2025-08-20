import { arg } from 'nexus';
import { Context } from '../../types';

export default ({ metrix }: Context) => {
  const { PUBLICATION_STATUS_TYPE_NAME } = metrix.plugin('graphql').service('constants');

  return arg({
    type: PUBLICATION_STATUS_TYPE_NAME,
    default: 'published',
  });
};
