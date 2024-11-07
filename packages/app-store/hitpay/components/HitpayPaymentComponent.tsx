import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { z } from "zod";

import { useHitPayDropIn } from "./HitPayDropIn";

const PaymentHitpayDataSchema = z.object({
  id: z.string(),
  url: z.string(),
});

interface IPaymentComponentProps {
  payment: {
    data: unknown;
  };
}

export const HitpayPaymentComponent = (props: IPaymentComponentProps) => {
  const { isInitialized, init, toggle } = useHitPayDropIn();
  const router = useRouter();
  const { payment } = props;
  const { data } = payment;
  const wrongUrl = (
    <>
      <p className="mt-3 text-center">Couldn&apos;t obtain payment URL</p>
    </>
  );

  const parsedData = PaymentHitpayDataSchema.safeParse(data);

  useEffect(() => {
    if (parsedData.success) {
      if (window.self !== window.top && window.top) {
        // window.top.open(parsedData.data.url, "_blank");
        if (!isInitialized) {
          init(
            "https://securecheckout.sandbox.hit-pay.com/payment-request/@self-hosted/",
            {
              // Optional, default is https
              // scheme: 'http',
              // Optional, default is hit-pay.com
              domain: "sandbox.hit-pay.com",
              // Optional default is false
              //closeOnError: true
            },
            // Optional callbacks
            {
              onClose: onClose,
              onSuccess: onSuccess,
              onError: onError,
            }
          );
        }

        toggle({
          paymentRequest: parsedData.data.id,
        });
      } else {
        router.replace(parsedData.data.url);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSuccess = () => {
    console.log("HitPayPaymentComponent onSuccess");
  };

  const onClose = () => {
    console.log("HitPayPaymentComponent onClose =>");
  };

  const onError = (error: any) => {
    console.log("HitPayPaymentComponent onError =>", error);
  };

  if (!parsedData.success || !parsedData.data?.url) {
    return wrongUrl;
  }

  return <div />;
};
