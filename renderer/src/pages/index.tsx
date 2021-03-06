import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import constants from 'utils/strings/constants';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { getOtt } from 'services/userService';
import Container from 'components/Container';
import { setData, LS_KEYS, getData } from 'utils/storage/localStorage';
interface formValues {
    email: string;
}

export default function Home() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        router.prefetch('/verify');
        router.prefetch('/signup');
        const user = getData(LS_KEYS.USER);
        if (user?.email) {
            router.push('/verify');
        }
    }, []);

    const loginUser = async (
        { email }: formValues,
        { setFieldError }: FormikHelpers<formValues>
    ) => {
        try {
            setLoading(true);
            await getOtt(email);
            setData(LS_KEYS.USER, { email });
            router.push('/verify');
        } catch (e) {
            setFieldError('email', `${constants.UNKNOWN_ERROR} ${e.message}`);
        }
        setLoading(false);
    };

    const register = () => {
        router.push('/signup');
    };

    return (
        <Container>
            <Card style={{ minWidth: '320px' }} className="text-center">
                <Card.Body style={{ padding: '40px 30px' }}>
                    <Card.Title style={{ marginBottom: '32px' }}>
                        {constants.LOGIN}
                    </Card.Title>
                    <Formik<formValues>
                        initialValues={{ email: '' }}
                        validationSchema={Yup.object().shape({
                            email: Yup.string()
                                .email(constants.EMAIL_ERROR)
                                .required(constants.REQUIRED),
                        })}
                        onSubmit={loginUser}
                    >
                        {({
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                            handleSubmit,
                        }) => (
                            <Form noValidate onSubmit={handleSubmit}>
                                <Form.Group controlId="formBasicEmail">
                                    <Form.Control
                                        type="email"
                                        placeholder={constants.ENTER_EMAIL}
                                        value={values.email}
                                        onChange={handleChange('email')}
                                        onBlur={handleBlur('email')}
                                        isInvalid={Boolean(
                                            touched.email && errors.email
                                        )}
                                        autoFocus={true}
                                        disabled={loading}
                                    />
                                    <FormControl.Feedback type="invalid">
                                        {errors.email}
                                    </FormControl.Feedback>
                                </Form.Group>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    block
                                    disabled={loading}
                                    style={{ marginBottom: '12px' }}
                                >
                                    {constants.LOGIN}
                                </Button>
                            </Form>
                        )}
                    </Formik>
                    <Card.Link
                        href="#"
                        onClick={register}
                        style={{ fontSize: '14px' }}
                    >
                        {constants.NO_ACCOUNT}
                    </Card.Link>
                </Card.Body>
            </Card>
        </Container>
    );
}
