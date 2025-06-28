import Link from "next/link";
import logo from "@/public/nolo-logo.png";
import Image from "next/image";
import { Moirai_One, Cherry_Bomb_One } from "next/font/google";

const moirai = Moirai_One({
  subsets: ["latin"],
  weight: ["400"],
});

const cherryBomb = Cherry_Bomb_One({
  subsets: ["latin"],
  weight: ["400"],
});

const Logo = ({
  logoWidth = "w-8",
  logoHeight = "h-9",
  textSize = "md:text-3xl",
}: {
  logoWidth?: string;
  logoHeight?: string;
  textSize?: string;
}) => {
  return (
    <Link href="/" className="flex max-h-fit justify-around gap-2 md:gap-2">
      <Image
        src={logo}
        alt="nolo-logo"
        className={`${logoWidth} ${logoHeight} md:w-10 md:h-11 mt-1`}
      />
      {/* <span
        className={`text-black max-h-fit font-black text-xl ${textSize} p-0 ${cherryBomb.className}`}
      >
        NoLo
      </span> */}
    </Link>
  );
};

export default Logo;
