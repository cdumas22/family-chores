import { useSearchParams } from "@remix-run/react";
import {
  Button,
  Col,
  Container,
  FloatingLabel,
  Form,
  Row,
} from "react-bootstrap";

import { json, type ActionArgs } from "@remix-run/node";
import { useActionData } from "@remix-run/react";

import prisma from "~/lib/db.server";
import { useState } from "react";

import { login, createUserSession, register } from "~/utils/session.server";

function validateUsername(username: string) {
  if (username.length < 3) {
    return "Usernames must be at least 3 characters long";
  }
}

function validatePassword(password: string) {
  if (password.length < 6) {
    return "Passwords must be at least 6 characters long";
  }
}

function validateUrl(url: string) {
  // add valid routes for redirect
  return "/";
}

type FieldErrors = { password?: string; username?: string };

export const action = async ({ request }: ActionArgs) => {
  const form = await request.formData();
  const loginType = form.get("loginType");
  const password = form.get("password");
  const username = form.get("username");
  const redirectTo = validateUrl((form.get("redirectTo") as string) || "/");
  const fields = { loginType, password, username };
  if (
    typeof loginType !== "string" ||
    typeof password !== "string" ||
    typeof username !== "string"
  ) {
    return json({
      fields,
      fieldErrors: {} as FieldErrors,
      error: `not submitted correctly`,
    });
  }

  const fieldErrors: FieldErrors = {
    password: validatePassword(password),
    username: validateUsername(username),
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    return json({
      fields,
      fieldErrors,
      error: `Not submitted correctly`,
    });
  }

  switch (loginType) {
    case "login": {
      const user = await login({ username, password });
      console.log({ user });
      if (!user) {
        return json({
          fieldErrors: {
            password: "Username/Password combination is incorrect",
          } as FieldErrors,
          fields,
        });
      }

      return createUserSession(user.id, redirectTo);
    }
    case "register": {
      const userExists = await prisma.user.findFirst({
        where: { username },
      });
      if (userExists) {
        fieldErrors.username = `User with username ${username} already exists`;
        return json({
          fields,
          fieldErrors,
        });
      }

      const user = await register({ username, password });
      if (!user) {
        return json({
          fieldErrors: {
            password: "Something went wrong trying to create a new user.",
          } as FieldErrors,
          fields,
        });
      }

      return createUserSession(user.id, redirectTo);
    }
    default: {
      return json({ fields, fieldErrors, error: `Login type invalid` });
    }
  }
};

export default function Login() {
  const [searchParams] = useSearchParams();
  const actionData = useActionData<typeof action>();

  const [validated, setValidated] = useState(actionData != null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    if (form?.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    setValidated(true);
  };
  return (
    <Container>
      <Row>
        <Col>
          <h1>Login</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form
            method="post"
            validated={validated}
            noValidate
            onSubmit={(e) => handleSubmit(e)}
          >
            <input
              type="hidden"
              name="redirectTo"
              value={searchParams.get("redirectTo") ?? undefined}
            />
            <div key={`inline-radio`} className="mb-3">
              <Form.Check
                inline
                label="Login"
                name="loginType"
                value="login"
                type="radio"
                id="inline-radio-1"
                defaultChecked={
                  !actionData?.fields?.loginType ||
                  actionData?.fields?.loginType === "login"
                }
              />
              <Form.Check
                inline
                label="Register"
                value="register"
                name="loginType"
                type="radio"
                id="inline-radio-2"
                defaultChecked={actionData?.fields?.loginType === "register"}
              />
            </div>
            <FloatingLabel
              controlId="username"
              label="Username"
              className="mb-3"
            >
              <Form.Control
                placeholder="Username"
                required
                name="username"
                // defaultValue={actionData?.fields.username ?? undefined}
                isValid={actionData?.fieldErrors.username == null}
              />
              <Form.Control.Feedback type="invalid">
                {actionData?.fieldErrors.username}
              </Form.Control.Feedback>
            </FloatingLabel>
            <FloatingLabel
              controlId="password"
              label="Password"
              className="mb-3"
            >
              <Form.Control
                placeholder="Password"
                required
                name="password"
                type="password"
                isValid={actionData?.fieldErrors.password == null}
              />
              <Form.Control.Feedback type="invalid">
                {actionData?.fieldErrors.password}
              </Form.Control.Feedback>
            </FloatingLabel>
            <Button type="submit">Submit</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
