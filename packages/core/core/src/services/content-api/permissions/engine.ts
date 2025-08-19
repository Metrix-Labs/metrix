import permissions from '@metrix/permissions';

type Options = Parameters<typeof permissions.engine.new>[0];

export default ({ providers }: Options) => permissions.engine.new({ providers });
