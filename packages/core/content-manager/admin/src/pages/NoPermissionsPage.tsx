import { Page, Layouts } from '@metrix/admin/metrix-admin';
import { useIntl } from 'react-intl';

import { getTranslation } from '../utils/translations';

const NoPermissions = () => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Layouts.Header
        title={formatMessage({
          id: getTranslation('header.name'),
          defaultMessage: 'Content',
        })}
      />
      <Layouts.Content>
        <Page.NoPermissions />
      </Layouts.Content>
    </>
  );
};

export { NoPermissions };
