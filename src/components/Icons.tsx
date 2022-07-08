import {ExclamationTriangleIcon} from "@patternfly/react-icons";

type IconProps = {
    color: string;
}

export const CustomExclamationTriangleIcon = (props: IconProps) => {
    return <ExclamationTriangleIcon style={{color:props.color}}/>
}

export const OrangeExclamationTriangleIcon = () => {
    return <CustomExclamationTriangleIcon color='orange'/>
}
