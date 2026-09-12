export {};

declare global {
  interface Window {
    payhere: {
      startPayment: (payload: Record<string, unknown>) => void;
      onCompleted?: (orderId: string) => void;
      onDismissed?: () => void;
      onError?: (error: string) => void;
    };
  }
}