import Image from "next/image";
import type { SVGProps } from "react";

export const Icons = {
    logo: (props: SVGProps<SVGSVGElement>) => (
        <Image
            src="/bgc-atlas-logo.svg"
            alt="BGC-Atlas Logo"
            width={
                typeof props.width === "number"
                    ? props.width
                    : Number(props.width) || 48   // fallback
            }
            height={
                typeof props.height === "number"
                    ? props.height
                    : Number(props.height) || 48
            }
            className={props.className}
        />
    ),
};