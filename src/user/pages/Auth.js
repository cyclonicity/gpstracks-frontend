import React, { useState, useContext, useRef } from 'react';

import Card from '../../shared/components/UIElements/Card';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
// import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import { VALIDATOR_EMAIL, VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import './Auth.css';

const Auth = () => {
  const auth = useContext(AuthContext);

  const [isLoginMode, setIsLoginMode] = useState(true);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  // const backendUrl = 'http://localhost:3001';
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost';
  const backendPort = process.env.REACT_APP_BACKEND_PORT || 3001;

  const [formState, inputHandler, setFormData] = useForm({
    name: undefined,
    email: {
      value: 'a@test.com',
      isValid: false
    },
    password: {
      value: '123456',
      isValid: false
    }
  });

  const prevName = useRef('');

  const switchModeHandler = () => {
    // console.log('Switching mode');
    if (!isLoginMode) {     // going TO login mode
      // console.log('Going TO login mode');
      prevName.current = formState.inputs.name.value;
      setFormData(
        {
          ...formState.inputs,
          name: undefined
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {                // going TO signup mode
      // console.log('Going TO signup mode');
      // console.log(formState.inputs);
      setFormData(
        {
          ...formState.inputs,
          name: {
            value: prevName.current,
            isValid: false
          }
          // image: {
          //   value: null,
          //   isValid: false
          // }
        },
        false
      );
      // console.log(formState.inputs);
    }
    setIsLoginMode(prevMode => !prevMode);
  };

  const authSubmitHandler = async event => {
    event.preventDefault();

    // console.log('authSubmitHandler enter');
    if (isLoginMode) {
      try {
        // console.log('Sending POST');
        const responseData = await sendRequest(
          `${backendUrl}:${backendPort}/login`,
          'POST',
          JSON.stringify({
            email: formState.inputs.email.value,
            password: formState.inputs.password.value
          }),
          {
            'Content-Type': 'application/json'
          },
        );
        // console.log(`Auth.js token ${responseData.token}`);

        // console.log('Calling auth.login');
        auth.login(responseData.userId, responseData.token);
      } catch (err) {
        console.log('authSubmitHandler login Error');
        if (err.name === "NS_ERROR_FILE_CORRUPTED") {
          console.log("Sorry, it looks like your browser storage has been corrupted. Please clear your storage by going to Tools -> Clear Recent History -> Cookies and set time range to 'Everything'. This will remove the corrupted browser storage across all sites.");
        } else {
          console.log(err.message);
        }
      }
    } else {
      try {
        const formData = new FormData();
        formData.append('email', formState.inputs.email.value);
        formData.append('name', formState.inputs.name.value);
        formData.append('password', formState.inputs.password.value);
        // formData.append('image', formState.inputs.image.value);
        const responseData = await sendRequest(
          `${backendUrl}:${backendPort}/register`,
          'POST',
          formData
        );

        auth.login(responseData.userId, responseData.token);
      } catch (err) {
        console.log('authSubmitHandler signup Error');
        if (err.name === "NS_ERROR_FILE_CORRUPTED") {
          console.log("Sorry, it looks like your browser storage has been corrupted. Please clear your storage by going to Tools -> Clear Recent History -> Cookies and set time range to 'Everything'. This will remove the corrupted browser storage across all sites.");
        } else {
          console.log(err.message);
        }
      }
    };
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Card className="authentication">
        {isLoading && <LoadingSpinner asOverlay />}
        <h2>Login Required</h2>
        <hr />
        <form onSubmit={authSubmitHandler}>
          {!isLoginMode && (
            <Input
              element="input"
              id="name"
              type="text"
              label="Your Name"
              initialValue={prevName.current}
              validators={[VALIDATOR_REQUIRE]}
              errorText="Please enter a NAME."
              onInput={inputHandler}
            />
          )}
          {/* {!isLoginMode && (
            <ImageUpload
              center
              id="image"
              onInput={inputHandler}
              errorText="Please provide an image." />
          )} */}
          <Input
            element="input"
            id="email"
            type="email"
            label="E-Mail"
            validators={[VALIDATOR_EMAIL()]}
            errorText="Please enter a valid email address."
            onInput={inputHandler}
          />
          <Input
            element="input"
            id="password"
            type="password"
            label="Password"
            validators={[VALIDATOR_MINLENGTH(6)]}
            errorText="Please enter a valid password (at least 6 characters)."
            onInput={inputHandler}
          />
          <Button
            type="submit"
            disabled={!formState.isValid}
          >
            {isLoginMode ? 'LOGIN' : 'SIGNUP'}
          </Button>
        </form>
        <Button
          inverse
          onClick={switchModeHandler}
        >
          SWITCH TO {isLoginMode ? 'SIGNUP' : 'LOGIN'}
        </Button>
      </Card>
    </React.Fragment>
  );
};


export default Auth;
