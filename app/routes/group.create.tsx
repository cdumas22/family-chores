import type { Group } from "@prisma/client";
import type { ActionFunction, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, type V2_MetaFunction } from "@remix-run/react";
import {
  Button,
  Col,
  Container,
  FloatingLabel,
  Row,
  Form as BForm,
} from "react-bootstrap";
import prisma from "~/lib/db.server";
import { requireUserId } from "~/utils/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request);
  return json({});
};

export let action: ActionFunction = async ({ request, params }) => {
  if (request.method === "POST") {
    const userId = await requireUserId(request);

    const data = await request.formData();
    const { isDefault, ...group } = Object.fromEntries(
      data
    ) as unknown as Group;
    if (isDefault) {
      await prisma.group.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    await prisma.group.create({
      data: {
        ...group,
        isDefault: isDefault ? true : false,
        userId,
        updatedAt: new Date(),
        createdAt: new Date(),
      },
    });

    return redirect(`/`);
  }
};

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Create Group" },
    { name: "description", content: "Create a group" },
  ];
};

export default () => {
  return (
    <Container>
      <Row>
        <Col>
          <h1>Create Group</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form method="POST">
            <FloatingLabel
              controlId="group.name"
              label="Group name"
              className="mb-3"
            >
              <BForm.Control required name="groupName" />
            </FloatingLabel>
            <BForm.Check
              type="checkbox"
              id={`isDefault-checkbox`}
              label={`Is default group`}
            />
            <Button type="submit">Save</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};
