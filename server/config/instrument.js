// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
import * as Sentry from "@sentry/node"
// import { nodeProfilingIntegration } from "@sentry/profiling-node"; // Disabled: native module issues

Sentry.init({
  dsn: "https://40dc79eacab0415b112a320613fe6de8@o4508103285538816.ingest.us.sentry.io/4510890581032960", // https://40dc79eacab0415b112a320613fe6de8@o4508103285538816.ingest.us.sentry.io/4510890581032960
  integrations: [
    // nodeProfilingIntegration(), // Disabled: native module issues on Windows/Vercel
    Sentry.mongooseIntegration()
  ],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
});
// Manually call startProfiler and stopProfiler
// to profile the code in between
// Sentry.profiler.startProfiler(); // Disabled: profiling integration disabled

// Starts a transaction that will also be profiled
Sentry.startSpan({
  name: "My First Transaction",
}, () => {
  // the code executing inside the transaction will be wrapped in a span and profiled
});

// Calls to stopProfiling are optional - if you don't stop the profiler, it will keep profiling
// your application until the process exits or stopProfiling is called.
Sentry.profiler.stopProfiler();