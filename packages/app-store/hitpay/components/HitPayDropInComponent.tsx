import type { ForwardedRef } from "react";
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";

interface InitOptions {
  scheme?: string;
  domain?: string;
  path?: string;
}

interface Callbacks {
  onClose?: () => void;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

interface CheckoutOptions {
  paymentRequest?: string;
}

interface HitPayOptions {
  visible: boolean;
  defaultUrl: string;
  initOptions: InitOptions;
  callbacks?: Callbacks;
  checkoutOptions: CheckoutOptions;
}

export interface HitPayDropInForwardProps {
  run: (paymentRequest: string) => void;
}

const HitPayDropIn = forwardRef((_, ref: ForwardedRef<HitPayDropInForwardProps>) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const iframe = useRef<HTMLIFrameElement | null>(null);
  const loadPromise = useRef<Promise<void> | null>(null);
  const resolveLoad = useRef<(() => void) | null>(null);
  const previousOverflow = useRef<string>("visible");
  const hitpayElem = useRef<HTMLDivElement | null>(null);
  const [useIframe, setUseIframe] = useState<boolean>(false);

  const hitPayOptions = useRef<HitPayOptions>({
    visible: false,
    defaultUrl: "",
    initOptions: { scheme: "", domain: "" },
    checkoutOptions: {},
  });

  const onSuccess = () => {
    console.log("HitPayPaymentComponent onSuccess");
  };

  const onClose = () => {
    console.log("HitPayPaymentComponent onClose =>");
  };

  const onError = (error: any) => {
    console.log("HitPayPaymentComponent onError =>", error);
  };

  useImperativeHandle(
    ref,
    () => {
      return {
        run(paymentRequest: string) {
          debugger;
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
            paymentRequest,
          });

          setUseIframe(true);
        },
      };
    },
    []
  );

  const init = async (url: string, initOptions: InitOptions, callbacks?: Callbacks) => {
    if (!isInitialized) {
      hitPayOptions.current.defaultUrl = url;
      hitPayOptions.current.initOptions = initOptions;
      hitPayOptions.current.callbacks = callbacks;

      const scheme = initOptions.scheme || "https";
      const domain = initOptions.domain || "hit-pay.com";
      const path = initOptions.path || "";

      iframe.current = document.createElement("iframe");
      iframe.current.setAttribute("src", `${scheme}://${domain}${path}/hitpay-iframe.html`);
      iframe.current.setAttribute("allow", "payment");
      iframe.current.style.position = "relative";
      iframe.current.style.margin = "auto";
      // iframe.current.style.position = "absolute";
      // iframe.current.style.border = "0";
      // iframe.current.style.width = "100%";
      // iframe.current.style.height = "100%";
      // iframe.current.style.margin = "0";
      // iframe.current.style.padding = "0";
      // iframe.current.style.zIndex = "99999999";
      // iframe.current.style.top = "0";
      // iframe.current.style.left = "0";
      iframe.current.style.display = "none";

      if (hitpayElem.current) {
        hitpayElem.current.appendChild(iframe.current);
      }
      // document.body.appendChild(iframe.current);

      loadPromise.current = new Promise((resolve) => {
        resolveLoad.current = resolve;
        resolve();
      });
    }
  };

  const toggle = async (checkoutOptions: CheckoutOptions) => {
    debugger;
    if (loadPromise.current) await loadPromise.current;

    if (hitPayOptions.current.visible) {
      document.body.style.overflow = previousOverflow.current;
    } else {
      previousOverflow.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      if (iframe.current) {
        iframe.current.style.display = "block";
      }
    }

    const delay = hitPayOptions.current.visible ? 0 : 500;
    setTimeout(() => {
      iframe.current?.contentWindow?.postMessage(
        {
          type: "toggle",
          props: {
            defaultUrl: hitPayOptions.current.defaultUrl,
            ...hitPayOptions.current.initOptions,
            checkoutOptions,
          },
        },
        "*"
      );

      hitPayOptions.current.visible = !hitPayOptions.current.visible;

      if (!hitPayOptions.current.visible) {
        if (iframe.current) {
          iframe.current.style.display = "none";
        }

        hitPayOptions.current.callbacks?.onClose && hitPayOptions.current.callbacks.onClose();
      }
    }, delay);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data) {
        switch (event.data.type) {
          case "loaded":
            loadPromise.current = null;
            setIsInitialized(true);
            if (resolveLoad.current) {
              resolveLoad.current();
            }
            break;
          case "toggle":
            toggle({});
            break;
          case "success":
            if (hitPayOptions.current.callbacks?.onSuccess) {
              hitPayOptions.current.callbacks?.onSuccess();
            }
            break;
          case "error":
            if (hitPayOptions.current.callbacks?.onError) {
              hitPayOptions.current.callbacks.onError(event.data.error);
            }
            break;
          default:
            break;
        }
      }
    };
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [isInitialized]);

  // return useIframe ? <div className="h-fit w-full" ref={hitpayElem} /> : <div />;
  return <div className="h-fit w-full" ref={hitpayElem} />;
});

HitPayDropIn.displayName = "HitPayDropIn";
export default HitPayDropIn;
