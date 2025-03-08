import React, { useEffect, useState, useRef } from 'react';
import countries from '../components/Auth/countries.json';
import Formicon from '../components/Auth/Formicon.jsx';
import Bg from '../components/Auth/Bg.jsx';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import RegistrationStage from '../components/Auth/RegistrationStage.jsx';
import { handleRequest } from '../utils/helperFunctions.js';

const Register = () => {
  const nav = useNavigate();
  const validationSchema = yup.object().shape({
    firstName: yup
      .string()
      .trim()
      .strict(true)
      .required('First name is required')
      .min(2)
      .max(20)
      .matches(/^[a-zA-Z]+$/, 'Only letters allowed'),

    lastName: yup
      .string()
      .trim()
      .strict(true)
      .required('Last name is required')
      .min(2)
      .max(20)
      .matches(/^[a-zA-Z]+$/, 'Only letters allowed'),

    birthDate: yup
      .date()
      .transform((value, originalValue) => {
        return originalValue ? value : undefined;
      })
      .typeError('Invalid date')
      .required('Date of birth is required'),

    gender: yup.string().trim().strict(true).oneOf(['male', 'female'], 'Invalid gender').required('Gender is required'),

    country: yup
      .string()
      .trim()
      .strict(true)
      .required('Country is required')
      .matches(/^[a-zA-Z\s]+$/, 'Only letters allowed'),

    userTag: yup
      .string()
      .trim('No spaces allowed')
      .strict(true)
      .required('User Tag is required')
      .matches(/^@[\S]+$/, 'Must start with "@" and contain no spaces')
      .min(4)
      .max(20),

    email: yup.string().trim().strict(true).lowercase().email('Invalid email').required('Email is required'),

    number: yup.string().trim().strict(true).matches(/^\d+$/, 'Must be a valid phone number').required('Phone number is required'),

    password: yup.string().trim().strict(true).min(8, 'Min 6 characters').required('Password is required'),

    confirmPassword: yup
      .string()
      .trim()
      .strict(true)
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
  });
  const verificationCodeRef = useRef();

  const [formStage, setFormStage] = useState(1);
  const [isLoading, setIsloading] = useState(false);
  const [redirectIn, setReddirectIn] = useState(7);

  const [verificationErr, setVerificationErr] = useState(null);

  const fetchingIntervalRef = useRef();
  const formData = useRef();

  useEffect(() => {
    if (redirectIn === 0) {
      nav('/login');
    }
  }, [redirectIn]);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    trigger,
  } = useForm({ resolver: yupResolver(validationSchema), mode: 'onChange' });

  async function nextBlock() {
    let isValid;
    switch (formStage) {
      case 1:
        isValid = await trigger(['firstName', 'lastName', 'birthDate', 'gender', 'country']);
        break;
      default:
        isValid = await trigger();
        break;
    }

    if (isValid && formStage === 2) {
      await handleSubmit(async (data) => {
        formData.current = data;
      })();

      await registerUser();
    }

    if (isValid && formStage < 2) {
      setFormStage((prev) => prev + 1);
    }

    if (formStage === 3) {
      await emailVerification();
    }
  }

  function prevBlock() {
    if (formStage > 1) {
      setFormStage((prev) => prev - 1);
    }
  }

  async function registerUser() {
    if (!formData.current) return;
    await handleRequest(
      new Request(`/api/auth/register`, {
        method: 'post',
        credentials: 'same-origin',
        body: JSON.stringify({ ...formData.current }),
        headers: { 'Content-Type': 'application/json' },
      }),
      fetchingIntervalRef,
      setIsloading,
      (data) => {
        setFormStage((prev) => prev + 1);
      },
      (err) => {
        if (err?.details) {
          err.details.forEach(({ msg, path }) => {
            setError(path, {
              type: 'server',
              message: msg || 'An error occurred',
            });
          });
        }
      }
    );
  }

  async function emailVerification() {
    // if (!formData.current) return;

    if (verificationCodeRef.current?.value.length < 6) {
      setVerificationErr('Invalid verification code');
      return;
    }
    await handleRequest(
      new Request(`/api/auth/verifyAccount`, {
        method: 'post',
        credentials: 'same-origin',
        body: JSON.stringify({ verificationCode: verificationCodeRef.current?.value.trim() }),
        headers: { 'Content-Type': 'application/json' },
      }),
      fetchingIntervalRef,
      setIsloading,
      (data) => {
        setFormStage((prev) => prev + 1);
        const interval = setInterval(() => {
          if (redirectIn === 0) clearInterval(interval);
          setReddirectIn((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
      },
      (err) => {
        if (err?.message) {
          setVerificationErr(err.message);
        }
      }
    );
  }

  return (
    <>
      <Bg />
      <div className="auth-page-container">
        <div className="regform-container">
          <div className="logo-side-container">
            <figure className="logo"></figure>
            <h1 className="wlcm-msg">
              Unleash your inner <span>kitten</span>
            </h1>
            <div className="ultimate-bg2"></div>
          </div>
          <div className="regform-wrapper">
            <ul className="formicons">
              <Formicon id="1" state={formStage} label="Personal" img="url('/images/icons/black.png')" />
              <span className={formStage >= 1 ? 'progress-bar progress-bar-active' : 'progress-bar'}></span>

              <Formicon id="2" state={formStage} label="Contact" img="url('/images/icons/volleyball.png')" />
              <span className={formStage >= 2 ? 'progress-bar progress-bar-active' : 'progress-bar'}></span>

              <Formicon id="3" state={formStage} label="Validation" img="url('/images/icons/pets.png')" />
              <span className={formStage >= 3 ? 'progress-bar progress-bar-active' : 'progress-bar'}></span>

              <Formicon id="4" state={formStage} label="Validation" img="url('/images/icons/animal.png')" />
            </ul>
            <form className="regform" id="regform">
              <div className="loader-container" style={isLoading == true ? { visibility: 'visible' } : {}}>
                <div className="spinner"></div>
              </div>
              <RegistrationStage stage={1} currentStage={formStage}>
                <div className="input-field">
                  <label>First Name {errors.firstName && <span>{`*${errors.firstName.message}*`}</span>}</label>
                  <input autoComplete="off" type="text" name="firstName" {...register('firstName')} className={errors.firstName ? 'err' : ''} />
                </div>
                <div className="input-field">
                  <label>Last Name {errors.lastName && <span>{`*${errors.lastName.message}*`}</span>}</label>
                  <input autoComplete="off" type="text" name="lastName" {...register('lastName')} className={errors.lastName ? 'err' : ''} />
                </div>
                <div className="input-field">
                  <label>Date Of Birth {errors.birthDate && <span>{`*${errors.birthDate.message}*`}</span>}</label>
                  <input autoComplete="off" type="date" name="birthDate" {...register('birthDate')} className={errors.birthDate ? 'err' : ''} />
                </div>
                <div className="input-field">
                  <label>Gender {errors.gender && <span>{`*${errors.gender.message}*`}</span>}</label>
                  <select name="gender" {...register('gender')} className={errors.gender ? 'err' : ''}>
                    <option value=""> Select Gender </option>
                    <option value="male"> Male </option>
                    <option value="female"> Female </option>
                  </select>
                </div>
                <div className="input-field">
                  <label>Country {errors.country && <span>{`*${errors.country.message}*`}</span>}</label>
                  <select name="country" {...register('country')} className={errors.country ? 'err' : ''}>
                    <option value="">Select country</option>
                    {countries.map((country) => {
                      return (
                        <option value={country.name} key={country.code}>
                          {country.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </RegistrationStage>
              <RegistrationStage stage={2} currentStage={formStage}>
                <div className="input-field">
                  <label>Email {errors.email && <span>{`*${errors.email.message}*`}</span>}</label>
                  <input type="email" {...register('email')} className={errors.email ? 'err' : ''} autoComplete="new-password" />
                </div>

                <div className="input-field">
                  <label>Phone Number {errors.number && <span>{`*${errors.number.message}*`}</span>}</label>
                  <input type="text" {...register('number')} className={errors.number ? 'err' : ''} autoComplete="new-password" />
                </div>

                <div className="input-field">
                  <label>User Tag {errors.userTag && <span>{`*${errors.userTag.message}*`}</span>}</label>
                  <input type="text" {...register('userTag')} className={errors.email ? 'err' : ''} autoComplete="new-password" />
                </div>
                <div className="input-field">
                  <label>Password {errors.password && <span>{`*${errors.password.message}*`}</span>}</label>
                  <input type="password" {...register('password')} className={errors.password ? 'err' : ''} autoComplete="new-password" />
                </div>

                <div className="input-field">
                  <label>Confirm Password {errors.confirmPassword && <span>{`*${errors.confirmPassword.message}*`}</span>}</label>
                  <input type="password" {...register('confirmPassword')} className={errors.confirmPassword ? 'err' : ''} autoComplete="new-password" />
                </div>
              </RegistrationStage>
              <RegistrationStage stage={3} currentStage={formStage}>
                <div className="additional-form-wrapper">
                  <div className="icon-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
                      <path d="M9,9.792c0,.437-.534,1.208-1.5,1.208s-1.5-.771-1.5-1.208,.534-.792,1.5-.792,1.5,.354,1.5,.792Zm7.5,10.208c.966,0,1.5-.771,1.5-1.208s-.534-.792-1.5-.792-1.5,.354-1.5,.792,.534,1.208,1.5,1.208ZM7.851,15h-.701c-3.456,0-7.149-1.289-7.149-4.907,0-.72,.467-1.617,1.183-2.358-.768-.36-1.183-1.078-1.183-2.101C0,4.043,2.454,0,4,0c.938,0,1.411,.462,1.827,.871,.103,.102,.222,.203,.341,.304,.405-.109,.846-.175,1.332-.175,.484,0,.922,.065,1.326,.173,.101-.091,.204-.184,.294-.272,.426-.422,.908-.901,1.88-.901,1.546,0,4,4.043,4,5.633,0,1-.399,1.706-1.134,2.074,.819,.831,1.134,1.761,1.134,2.386,0,3.618-3.693,4.907-7.149,4.907ZM9.845,1.59c2.215,1.236,2.903,4.084,3.08,5.121,.014,.085,.057,.153,.1,.218,.656-.14,.974-.538,.974-1.296,0-1.324-2.291-4.633-3-4.633-.549,0-.784,.223-1.155,.59ZM1,5.633c0,.767,.325,1.166,.997,1.301,.028-.05,.061-.097,.071-.158,.174-1.049,.853-3.928,3.074-5.179-.005-.004-.01-.009-.015-.013-.372-.365-.597-.585-1.127-.585-.709,0-3,3.309-3,4.633Zm13,4.459c0-.553-.42-1.451-1.343-2.117-.008-.006-.013-.012-.021-.018-.135-.045-.244-.145-.3-.277-.207-.234-.346-.503-.397-.8-.251-1.467-1.187-4.88-4.44-4.88-3.273,0-4.199,3.455-4.446,4.94-.056,.341-.232,.647-.501,.902-.008,.008-.017,.016-.026,.023-.044,.04-.084,.083-.133,.12-.961,.732-1.394,1.673-1.394,2.107,0,3.625,4.707,3.907,6.149,3.907h.701c1.442,0,6.149-.282,6.149-3.907Zm9.176-.95c-.073-.467-.375-.858-.809-1.046-.438-.189-.932-.141-1.324,.128-.033,.022-.063,.049-.089,.078l-1.666,1.852c-.525-.224-1.076-.384-1.643-.476-.28-.044-.53,.141-.574,.414-.044,.273,.141,.529,.414,.574,.595,.096,1.17,.279,1.707,.544,.199,.099,.443,.053,.593-.114l1.864-2.072c.139-.073,.269-.033,.321-.011,.056,.024,.189,.101,.218,.282,.254,1.644,.812,5.957,.812,8.062,0,3.111-2.531,5.643-5.643,5.643h-1.857c-3.033,0-5.5-2.468-5.5-5.5,0-.276-.224-.5-.5-.5s-.5,.224-.5,.5c0,3.584,2.916,6.5,6.5,6.5h1.857c3.663,0,6.643-2.979,6.643-6.643,0-2.162-.566-6.546-.824-8.215ZM6.5,7c0-.552-.448-1-1-1s-1,.448-1,1,.448,1,1,1,1-.448,1-1Zm3-1c-.552,0-1,.448-1,1s.448,1,1,1,1-.448,1-1-.448-1-1-1Zm4.5,9c-.552,0-1,.448-1,1s.448,1,1,1,1-.448,1-1-.448-1-1-1Zm6,1c0-.552-.448-1-1-1s-1,.448-1,1,.448,1,1,1,1-.448,1-1Z" />
                    </svg>
                    <h1>
                      Almost there! Check your email to verify your <span>paws</span>!{' '}
                    </h1>
                  </div>
                  <div className="input-field">
                    <input
                      type="text"
                      onChange={() => {
                        setVerificationErr(null);
                      }}
                      ref={verificationCodeRef}
                      name="VerificationCode"
                      className={verificationErr ? 'err' : ''}
                      autoComplete="new-password"
                    />
                    <label>{verificationErr && <span>{`*${verificationErr}*`}</span>}</label>
                  </div>
                </div>
              </RegistrationStage>
              <RegistrationStage stage={4} currentStage={formStage}>
                <div className="additional-form-wrapper" style={{ width: '100%' }}>
                  <div className="icon-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
                      <path d="M9,9.792c0,.437-.534,1.208-1.5,1.208s-1.5-.771-1.5-1.208,.534-.792,1.5-.792,1.5,.354,1.5,.792Zm7.5,10.208c.966,0,1.5-.771,1.5-1.208s-.534-.792-1.5-.792-1.5,.354-1.5,.792,.534,1.208,1.5,1.208ZM7.851,15h-.701c-3.456,0-7.149-1.289-7.149-4.907,0-.72,.467-1.617,1.183-2.358-.768-.36-1.183-1.078-1.183-2.101C0,4.043,2.454,0,4,0c.938,0,1.411,.462,1.827,.871,.103,.102,.222,.203,.341,.304,.405-.109,.846-.175,1.332-.175,.484,0,.922,.065,1.326,.173,.101-.091,.204-.184,.294-.272,.426-.422,.908-.901,1.88-.901,1.546,0,4,4.043,4,5.633,0,1-.399,1.706-1.134,2.074,.819,.831,1.134,1.761,1.134,2.386,0,3.618-3.693,4.907-7.149,4.907ZM9.845,1.59c2.215,1.236,2.903,4.084,3.08,5.121,.014,.085,.057,.153,.1,.218,.656-.14,.974-.538,.974-1.296,0-1.324-2.291-4.633-3-4.633-.549,0-.784,.223-1.155,.59ZM1,5.633c0,.767,.325,1.166,.997,1.301,.028-.05,.061-.097,.071-.158,.174-1.049,.853-3.928,3.074-5.179-.005-.004-.01-.009-.015-.013-.372-.365-.597-.585-1.127-.585-.709,0-3,3.309-3,4.633Zm13,4.459c0-.553-.42-1.451-1.343-2.117-.008-.006-.013-.012-.021-.018-.135-.045-.244-.145-.3-.277-.207-.234-.346-.503-.397-.8-.251-1.467-1.187-4.88-4.44-4.88-3.273,0-4.199,3.455-4.446,4.94-.056,.341-.232,.647-.501,.902-.008,.008-.017,.016-.026,.023-.044,.04-.084,.083-.133,.12-.961,.732-1.394,1.673-1.394,2.107,0,3.625,4.707,3.907,6.149,3.907h.701c1.442,0,6.149-.282,6.149-3.907Zm9.176-.95c-.073-.467-.375-.858-.809-1.046-.438-.189-.932-.141-1.324,.128-.033,.022-.063,.049-.089,.078l-1.666,1.852c-.525-.224-1.076-.384-1.643-.476-.28-.044-.53,.141-.574,.414-.044,.273,.141,.529,.414,.574,.595,.096,1.17,.279,1.707,.544,.199,.099,.443,.053,.593-.114l1.864-2.072c.139-.073,.269-.033,.321-.011,.056,.024,.189,.101,.218,.282,.254,1.644,.812,5.957,.812,8.062,0,3.111-2.531,5.643-5.643,5.643h-1.857c-3.033,0-5.5-2.468-5.5-5.5,0-.276-.224-.5-.5-.5s-.5,.224-.5,.5c0,3.584,2.916,6.5,6.5,6.5h1.857c3.663,0,6.643-2.979,6.643-6.643,0-2.162-.566-6.546-.824-8.215ZM6.5,7c0-.552-.448-1-1-1s-1,.448-1,1,.448,1,1,1,1-.448,1-1Zm3-1c-.552,0-1,.448-1,1s.448,1,1,1,1-.448,1-1-.448-1-1-1Zm4.5,9c-.552,0-1,.448-1,1s.448,1,1,1,1-.448,1-1-.448-1-1-1Zm6,1c0-.552-.448-1-1-1s-1,.448-1,1,.448,1,1,1,1-.448,1-1Z" />
                    </svg>
                    <h1>
                      🎉 Welcome to <span>Mittens!</span> 🐾 Your account has been successfully registered! 😻 You'll be redirected to the login page in a few seconds <span>{redirectIn} ✨</span>
                    </h1>
                  </div>
                </div>
              </RegistrationStage>
            </form>
            <div className="form-btnZ-container">
              <div className="btnz">
                <button className={formStage == 2 ? 'form-btn' : 'hide-btn'} onClick={prevBlock}>
                  Back
                </button>
                <button className={formStage != 4 ? 'form-btn' : 'hide-btn'} onClick={nextBlock}>
                  Continue
                </button>
              </div>
            </div>
            <div className="form-links" style={{ marginInline: 'auto', width: '200px' }}>
              {formStage != 4 && (
                <Link to="/login" style={{ marginTop: '0.9rem' }}>
                  Already Have an account?
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
