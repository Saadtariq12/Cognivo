import cognivoLogo from "../../assets/CognivoLogo.png";

type CognivoMarkProps = {
  className?: string;
};

export const CognivoMark = ({ className }: CognivoMarkProps) => (
  <img
    src={cognivoLogo}
    alt=""
    className={`h-13 w-auto max-h-12 shrink-0 object-contain ${className ?? ""}`}
  />
);
