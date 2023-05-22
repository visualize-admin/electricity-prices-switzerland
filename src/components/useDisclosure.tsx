import { useState } from "react";

export const useDisclosure = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);
  return { isOpen, open, close, setIsOpen };
};
