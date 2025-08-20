import { defineProvider } from './provider';
import createTelemetry from '../services/metrics';

export default defineProvider({
  init(metrix) {
    metrix.add('telemetry', () => createTelemetry(metrix));
  },
  async register(metrix) {
    metrix.get('telemetry').register();
  },
  async bootstrap(metrix) {
    metrix.get('telemetry').bootstrap();
  },
  async destroy(metrix) {
    metrix.get('telemetry').destroy();
  },
});
