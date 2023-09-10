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
    return json(
      {
        fields,
        fieldErrors: {} as { password?: string; username?: string },
        error: `not submitted correctly`,
      },
      {
        status: 400,
      }
    );
  }

  const fieldErrors = {
    password: validatePassword(password),
    username: validateUsername(username),
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    return json(
      {
        fields,
        fieldErrors,
        error: `Not submitted correctly`,
      },
      {
        status: 400,
      }
    );
  }

  switch (loginType) {
    case "login": {
      // login to get the user
      // if there's no user, return the fields and a formError
      // if there is a user, create their session and redirect to /jokes
      return json(
        {
          fields,
          fieldErrors,
          error: `User with username ${username} already exists`,
        },
        {
          status: 400,
        }
      );
    }
    case "register": {
      const userExists = await prisma.user.findFirst({
        where: { username },
      });
      if (userExists) {
        return json(
          {
            fields,
            fieldErrors,
            error: `User with username ${username} already exists`,
          },
          {
            status: 400,
          }
        );
      }
      // create the user
      // create their session and redirect to /jokes
      return json(
        { fields, fieldErrors, error: `not implemented` },
        {
          status: 400,
        }
      );
    }
    default: {
      return json(
        { fields, fieldErrors, error: `Login type invalid` },
        {
          status: 400,
        }
      );
    }
  }
};

export default function Login() {
  const [searchParams] = useSearchParams();
  const actionData = useActionData<typeof action>();
  return (
    <Container>
      <Row>
        <Col>
          <h1>Login</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form method="post" noValidate>
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
                defaultValue={actionData?.fields.username ?? undefined}
                isValid={actionData?.fieldErrors.password == null}
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
