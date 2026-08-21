import { useState,useEffect } from "react";
import {
  useActionData,
  useNavigate,
  useNavigation,
  Form,
} from "react-router";

import {
  Page,
  Layout,
  Card,
  TextField,
  Button,
  BlockStack,
  Banner,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import db from "../db.server";


export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const formData = await request.formData();

  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();

  if (!name || !email) {
    return {
      error: "Name and email are required.",
    };
  }

  const existingStudent = await db.student.findUnique({
    where: {
      shop_email: {
        shop: session.shop,
        email,
      },
    },
  });

  if (existingStudent) {
    return {
      error: "A student with this email already exists.",
    };
  }

  await db.student.create({
    data: {
      shop: session.shop,
      name,
      email,
    },
  });

  return {
    success: true,
  };
};


export default function NewStudentPage() {
  const actionData = useActionData();

  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (actionData?.success) {
      navigate("/app/students");
    }
  }, [actionData, navigate]);

  return (
    <Page
      title="Add Student"
      backAction={{
        content: "Students",
        onAction: () =>
          navigate("/app/students"),
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <Form method="post">
              <BlockStack gap="400">

                {actionData?.error && (
                  <Banner tone="critical">
                    {actionData.error}
                  </Banner>
                )}

                <TextField
                  label="Student Name"
                  name="name"
                  value={name}
                  onChange={setName}
                  autoComplete="name"
                />

                <TextField
                  label="Student Email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                />

                <Button
                  submit
                  variant="primary"
                  loading={isSubmitting}
                >
                  Add Student
                </Button>

              </BlockStack>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}