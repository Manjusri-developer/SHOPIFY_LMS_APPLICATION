import { useLoaderData, useNavigate, useNavigation, useActionData, Form } from "react-router";
import { useState, useEffect } from "react";
import {
  Page,
  Layout,
  Card,
  TextField,
  Select,
  Button,
  BlockStack,
  Banner,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const courseId = Number(params.id);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    throw new Response("Invalid course ID", { status: 400 });
  }

  const course = await db.course.findFirst({
    where: { id: courseId, shop: session.shop },
  });

  if (!course) {
    throw new Response("Course not found", { status: 404 });
  }

  return { course };
};

export const action = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const courseId = Number(params.id);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    throw new Response("Invalid course ID", { status: 400 });
  }

  const formData = await request.formData();
  const title = formData.get("title");
  const description = formData.get("description");
  const instructor = formData.get("instructor");
  const category = formData.get("category");
  const duration = Number(formData.get("duration"));
  const durationUnit = formData.get("durationUnit");
  const status = formData.get("status");

  if (!title || !description || !instructor || !category || !duration || !durationUnit || !status) {
    return { error: "All fields are required" };
  }

  const course = await db.course.findFirst({
    where: { id: courseId, shop: session.shop },
  });

  if (!course) {
    throw new Response("Course not found", { status: 404 });
  }

  await db.course.update({
    where: { id: courseId },
    data: {
      title: title.toString(),
      description: description.toString(),
      instructor: instructor.toString(),
      category: category.toString(),
      duration,
      durationUnit: durationUnit.toString(),
      status: status.toString(),
    },
  });

  return { success: true };
};

export default function EditCoursePage() {
  const { course } = useLoaderData();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const actionData = useActionData();
  const isSubmitting = navigation.state === "submitting";

  // Seed initial state FROM the course, not empty strings
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const [instructor, setInstructor] = useState(course.instructor);
  const [category, setCategory] = useState(course.category);
  const [duration, setDuration] = useState(String(course.duration));
  const [durationUnit, setDurationUnit] = useState(course.durationUnit);
  const [status, setStatus] = useState(course.status);

  useEffect(() => {
    if (actionData?.success) {
      navigate(`/app/course/${course.id}`);
    }
  }, [actionData, navigate, course.id]);

  return (
    <Page
      title="Edit Course"
      backAction={{ content: "Course", onAction: () => navigate(`/app/courses/${course.id}`) }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            {actionData?.error && <Banner tone="critical">{actionData.error}</Banner>}
            <Form method="post">
              <BlockStack gap="400">
                <TextField label="Title" name="title" value={title} onChange={setTitle} autoComplete="off" />
                <TextField label="Description" name="description" value={description} onChange={setDescription} multiline={4} autoComplete="off" />
                <TextField label="Instructor" name="instructor" value={instructor} onChange={setInstructor} autoComplete="off" />
                <TextField label="Category" name="category" value={category} onChange={setCategory} autoComplete="off" />
                <TextField label="Duration" name="duration" type="number" value={duration} onChange={setDuration} autoComplete="off" />
                <Select
                  label="Duration Unit"
                  name="durationUnit"
                  value={durationUnit}
                  onChange={setDurationUnit}
                  options={[
                    { label: "Hours", value: "HOURS" },
                    { label: "Days", value: "DAYS" },
                    { label: "Weeks", value: "WEEKS" },
                    { label: "Months", value: "MONTHS" },
                  ]}
                />
                <Select
                  label="Status"
                  name="status"
                  value={status}
                  onChange={setStatus}
                  options={[
                    { label: "Active", value: "ACTIVE" },
                    { label: "Inactive", value: "INACTIVE" },
                  ]}
                />
                <Button submit variant="primary" loading={isSubmitting}>
                  Save Changes
                </Button>
              </BlockStack>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}