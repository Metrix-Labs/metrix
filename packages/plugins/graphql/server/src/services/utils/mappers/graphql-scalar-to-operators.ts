import { get, map, mapValues } from 'lodash/fp';
import type { Context } from '../../types';

export default ({ metrix }: Context) => ({
  graphqlScalarToOperators(graphqlScalar: string) {
    const { GRAPHQL_SCALAR_OPERATORS } = metrix.plugin('graphql').service('constants');
    const { operators } = metrix.plugin('graphql').service('builders').filters;

    const associations = mapValues(
      map((operatorName: string) => operators[operatorName]),
      GRAPHQL_SCALAR_OPERATORS
    );

    return get(graphqlScalar, associations);
  },
});
