import classNames from 'classnames';

type ButtonProps = {
  className?: string;
  props?: any;
};

const LoadingSpinner = ({ className = 'spinner-border-lg text-primary', props }: ButtonProps) => {
  return (
    <span {...props} className={classNames('spinner-border', className)} role="status">
      <span className="sr-only">Loading...</span>
    </span>
  );
};

export default LoadingSpinner;
