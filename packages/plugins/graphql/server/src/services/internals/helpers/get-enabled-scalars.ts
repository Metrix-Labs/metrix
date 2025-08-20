import { first } from 'lodash/fp';
import type { Context } from '../../types';
import type { Constants } from '../../constants';

export default ({ metrix }: Context) =>
  () => {
    const { GRAPHQL_SCALAR_OPERATORS } = metrix.plugin('graphql').service<Constants>('constants');

    return (
      Object.entries(GRAPHQL_SCALAR_OPERATORS)
        // To be valid, a GraphQL scalar must have at least one operator enabled
        .filter(([, value]) => value.length > 0)
        // Only keep the key (the scalar name)
        .map(first)
    );
  };
