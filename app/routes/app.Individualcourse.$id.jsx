import {
  useLoaderData,
  useNavigate,
  Form,
  redirect,
} from "react-router";

import {
  Page,
  Layout,
  Card,
  Text,
  Badge,
  Divider,
  Button,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import db from "../db.server";


export const loader = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);

  const courseId = Number(params.id);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    throw new Response("Invalid course ID", {
      status: 400,
    });
  }

  const course = await db.course.findFirst({
    where: {
      id: courseId,
      shop: session.shop,
    },
  });

  if (!course) {
    throw new Response("Course not found", {
      status: 404,
    });
  }

  return {
    course,
  };
};


/* =========================
   ACTION - DELETE COURSE
   ========================= */

export const action = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);

  const courseId = Number(params.id);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    throw new Response("Invalid course ID", {
      status: 400,
    });
  }

  const formData = await request.formData();

  const intent = formData.get("intent");

  if (intent !== "delete") {
    throw new Response("Invalid action", {
      status: 400,
    });
  }

  /* Check course belongs to current shop */

  const course = await db.course.findFirst({
    where: {
      id: courseId,
      shop: session.shop,
    },
  });

  if (!course) {
    throw new Response("Course not found", {
      status: 404,
    });
  }

  /* Delete course */

  await db.course.delete({
    where: {
      id: courseId,
    },
  });

  /* Go back to courses list */

  return redirect("/app/courses");
};


/* =========================
   COMPONENT
   ========================= */

export default function CourseDetailsPage() {
  const { course } = useLoaderData();

  const navigate = useNavigate();

  return (
    <Page
      title={course.title}
      backAction={{
        content: "Courses",
        onAction: () => navigate("/app/courses"),
      }}
      primaryAction={{
        content: "Edit course",
        onAction: () =>
          navigate(`/app/editcourses/${course.id}/edit`),
      }}
    >
      <Layout>

        {/* =========================
            COURSE DETAILS
            ========================= */}

        <Layout.Section>
          <Card>
            <Text variant="headingMd" as="h2">
              Course Details
            </Text>

            <br />

            <Text as="p">
              <strong>Description:</strong>{" "}
              {course.description}
            </Text>

            <br />

            <Text as="p">
              <strong>Instructor:</strong>{" "}
              {course.instructor}
            </Text>

            <br />

            <Text as="p">
              <strong>Category:</strong>{" "}
              {course.category}
            </Text>

            <br />

            <Text as="p">
              <strong>Duration:</strong>{" "}
              {course.duration}{" "}
              {course.durationUnit.toLowerCase()}
            </Text>

            <br />

            <Text as="p">
              <strong>Created Date:</strong>{" "}
              {new Date(
                course.createdAt
              ).toLocaleDateString()}
            </Text>

            <br />

            {/* DELETE BUTTON */}

            <Form method="post">
              <input
                type="hidden"
                name="intent"
                value="delete"
              />

              <Button
                submit
                tone="critical"
              >
                Delete Course
              </Button>
            </Form>
          </Card>
        </Layout.Section>


        {/* =========================
            COURSE STATUS
            ========================= */}

        <Layout.Section variant="oneThird">
          <Card>
            <Text variant="headingMd" as="h2">
              Course Status
            </Text>

            <br />

            <Badge
              tone={
                course.status === "ACTIVE"
                  ? "success"
                  : "critical"
              }
            >
              {course.status === "ACTIVE"
                ? "Active"
                : "Inactive"}
            </Badge>
          </Card>
        </Layout.Section>


        {/* =========================
            ENROLLMENT INFORMATION
            ========================= */}

        <Layout.Section>
          <Card>
            <Text variant="headingMd" as="h2">
              Enrollment Information
            </Text>

            <Divider />

            <br />

            <Text as="p">
              Enrollment management will be available here.
            </Text>
          </Card>
        </Layout.Section>

      </Layout>
    </Page>
  );
}