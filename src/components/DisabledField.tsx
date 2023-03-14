import { connectField } from 'uniforms';

export type DisabledFieldProps = {
  label: string;
  labelIcon: JSX.Element | undefined;
};

function DisabledField(props: DisabledFieldProps) {
  return (
    <div className="pf-u-disabled-color-100 pf-u-background-color-200">
      {props.label} {props.labelIcon}
    </div>
  );
}

export default connectField<DisabledFieldProps>(DisabledField);
