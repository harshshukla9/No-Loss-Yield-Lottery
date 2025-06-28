import Link from "next/link";
import { Button } from "./ui/button";

const EnterAppButton = () => {
  return (
    <Button className="bg-black text-white hover:bg-gray-800">
      <Link href="/lottery">Enter App</Link>
    </Button>
  );
};

export default EnterAppButton;
