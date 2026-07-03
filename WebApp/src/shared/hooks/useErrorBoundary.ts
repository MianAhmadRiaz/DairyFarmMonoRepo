// import { useState, useEffect } from 'react';

// interface ErrorBoundaryState {
//   hasError: boolean;
//   error?: Error;
// }

// export const useErrorBoundary = () => {
//   const [errorBoundaryState, setErrorBoundaryState] =
//     useState <
//     ErrorBoundaryState >
//     {
//       hasError: false
//     };

//   const resetError = () => {
//     setErrorBoundaryState({ hasError: false, error: undefined });
//   };

//   const captureError = (error: Error) => {
//     setErrorBoundaryState({ hasError: true, error });
//   };

//   // Catch unhandled promise rejections
//   useEffect(() => {
//     const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
//       console.error('Unhandled promise rejection:', event.reason);
//       captureError(new Error(`Unhandled promise rejection: ${event.reason}`));
//     };

//     window.addEventListener('unhandledrejection', handleUnhandledRejection);

//     return () => {
//       window.removeEventListener(
//         'unhandledrejection',
//         handleUnhandledRejection
//       );
//     };
//   }, []);

//   return {
//     hasError: errorBoundaryState.hasError,
//     error: errorBoundaryState.error,
//     resetError,
//     captureError
//   };
// };

// export default useErrorBoundary;
