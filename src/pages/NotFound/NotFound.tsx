import { useHistory } from 'react-router-dom';
import Button from '../../components/Button';
import ErrorPage from '../ErrorPage';

const NotFound = () => {
  const history = useHistory();
  const onButtonClick = () => {
    history.push(`/`);
  };
  return (
    <ErrorPage
      headline="404"
      message="Oops, that page doesn't exist"
      description={
        <>
          <p>
            It&lsquo;s not you, it&lsquo;s us. It looks like the page doesn&lsquo;t exist. Let&lsquo;s take you back.
          </p>
          <Button className="button--blue" onClick={onButtonClick}>
            Back to app
          </Button>
        </>
      }
    />
  );
};

export default NotFound;
