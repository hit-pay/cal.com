import { useEffect, useRef } from "react";
import { z } from "zod";

import type { HitPayDropInForwardProps } from "./HitPayDropInComponent";
import HitPayDropIn from "./HitPayDropInComponent";

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
  const dropInRef = useRef<HitPayDropInForwardProps | null>(null);
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
      if (dropInRef.current) {
        dropInRef.current.run(parsedData.data.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!parsedData.success || !parsedData.data?.url) {
    return wrongUrl;
  }

  return <HitPayDropIn ref={dropInRef} />;
};
