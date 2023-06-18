import { swatch, fileIcon, ai, logoShirt, stylishShirt } from "../assets";
import { IoMdMoon, IoMdSunny } from 'react-icons/io'
import { FaImage, FaRobot } from 'react-icons/fa'
import { FiFileText } from 'react-icons/fi'

export const EditorTabs = [
  {
    name: "imagepicker",
    icon: <FaImage size={30} />,
  },
  {
    name: "textpicker",
    icon: <FiFileText size={30} />,
  },
  {
    name: "promptpicker",
    icon: <FaRobot size={30} />,
  },
];

export const FilterTabs = [
  {
    name: "logoShirt",
    icon: logoShirt,
  },
  {
    name: "stylishShirt",
    icon: stylishShirt,
  },
];

export const DecalTypes = {
  logo: {
    stateProperty: "logoDecal",
    filterTab: "logoShirt",
  },
  full: {
    stateProperty: "fullDecal",
    filterTab: "stylishShirt",
  },
};
