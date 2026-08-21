import {
  useLoaderData,
  useNavigate,
  Form,
} from "react-router";

import {
  Page,
  Layout,
  Card,
  Text,
  Badge,
  IndexTable,
  Select,
  Button,
  BlockStack,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import db from "../db.server";


/* =========================
   LOADER
   ========================= */

export const loader = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);

  const studentId = Number(params.id);

  if (
    !Number.isInteger(studentId) ||
    studentId <= 0
  ) {
    throw new Response("Invalid student ID", {
      status: 400,
    });
  }


  const student = await db.student.findFirst({
    where: {
      id: studentId,
      shop: session.shop,
    },

    include: {
      enrollments: {
        include: {
          course: true,
        },

        orderBy: {
          enrollmentDate: "desc",
        },
      },
    },
  });


  if (!student) {
    throw new Response("Student not found", {
      status: 404,
    });
  }


  return {
    student,
  };
};


/* =========================
   ACTION
   ========================= */

export const action = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);

  const studentId = Number(params.id);

  if (
    !Number.isInteger(studentId) ||
    studentId <= 0
  ) {
    throw new Response("Invalid student ID", {
      status: 400,
    });
  }


  const formData = await request.formData();

  const enrollmentId = Number(
    formData.get("enrollmentId")
  );

  const status = formData
    .get("status")
    ?.toString();


  if (
    !Number.isInteger(enrollmentId) ||
    !status
  ) {
    throw new Response("Invalid enrollment data", {
      status: 400,
    });
  }


  if (
    status !== "IN_PROGRESS" &&
    status !== "COMPLETED"
  ) {
    throw new Response("Invalid enrollment status", {
      status: 400,
    });
  }


  /* Verify student belongs to shop */

  const student = await db.student.findFirst({
    where: {
      id: studentId,
      shop: session.shop,
    },
  });

  if (!student) {
    throw new Response("Student not found", {
      status: 404,
    });
  }


  /* Verify enrollment belongs to student + shop */

  const enrollment =
    await db.enrollment.findFirst({
      where: {
        id: enrollmentId,
        studentId,
        shop: session.shop,
      },
    });


  if (!enrollment) {
    throw new Response("Enrollment not found", {
      status: 404,
    });
  }


  /* Update enrollment */

  await db.enrollment.update({
    where: {
      id: enrollmentId,
    },

    data: {
      status,
    },
  });


  return {
    success: true,
  };
};


/* =========================
   COMPONENT
   ========================= */

export default function StudentDetailsPage() {
  const { student } = useLoaderData();

  const navigate = useNavigate();


  const rows = student.enrollments.map(
    (enrollment, index) => (
      <IndexTable.Row
        id={String(enrollment.id)}
        key={enrollment.id}
        position={index}
      >

        {/* Course */}

        <IndexTable.Cell>
          {enrollment.course.title}
        </IndexTable.Cell>


        {/* Enrollment Date */}

        <IndexTable.Cell>
          {new Date(
            enrollment.enrollmentDate
          ).toLocaleDateString()}
        </IndexTable.Cell>


        {/* Status */}

        <IndexTable.Cell>
          <Badge
            tone={
              enrollment.status === "COMPLETED"
                ? "success"
                : "attention"
            }
          >
            {enrollment.status === "COMPLETED"
              ? "Completed"
              : "In Progress"}
          </Badge>
        </IndexTable.Cell>


        {/* Update Status */}

        <IndexTable.Cell>
          <Form method="post">

            <input
              type="hidden"
              name="enrollmentId"
              value={enrollment.id}
            />

            <Select
              label="Status"
              labelHidden
              name="status"
              options={[
                {
                  label: "In Progress",
                  value: "IN_PROGRESS",
                },
                {
                  label: "Completed",
                  value: "COMPLETED",
                },
              ]}
              defaultValue={enrollment.status}
            />

            <br />

            <Button submit>
              Update
            </Button>

          </Form>
        </IndexTable.Cell>

      </IndexTable.Row>
    )
  );


  return (
    <Page
      title={student.name}
      backAction={{
        content: "Students",
        onAction: () =>
          navigate("/app/students"),
      }}
      primaryAction={{
        content: "Enroll in course",
        onAction: () =>
          navigate("/app/enrollments/new"),
      }}
    >

      <Layout>

        {/* =========================
            STUDENT INFORMATION
            ========================= */}

        <Layout.Section>
          <Card>

            <BlockStack gap="300">

              <Text
                variant="headingMd"
                as="h2"
              >
                Student Information
              </Text>

              <Text as="p">
                <strong>Name:</strong>{" "}
                {student.name}
              </Text>

              <Text as="p">
                <strong>Email:</strong>{" "}
                {student.email}
              </Text>

              <Text as="p">
                <strong>Student Since:</strong>{" "}
                {new Date(
                  student.createdAt
                ).toLocaleDateString()}
              </Text>

            </BlockStack>

          </Card>
        </Layout.Section>

{/* =========================
    ENROLLMENT SUMMARY
    ========================= */}

<Layout.Section>
  <Card>
    <Text
      variant="headingMd"
      as="h2"
    >
      Enrollment Summary
    </Text>

    <br />

    <Text
      variant="heading2xl"
      as="p"
    >
      {student.enrollments.length}
    </Text>

    <Text as="p">
      Total Enrollments
    </Text>
  </Card>
</Layout.Section>

        {/* =========================
            ENROLLED COURSES
            ========================= */}

        <Layout.Section>
          <Card>

            <Text
              variant="headingMd"
              as="h2"
            >
              Enrolled Courses
            </Text>

            <br />

            {student.enrollments.length === 0 ? (
              <Text as="p">
                This student is not enrolled in
                any courses.
              </Text>
            ) : (
              <IndexTable
                resourceName={{
                  singular: "enrollment",
                  plural: "enrollments",
                }}
                itemCount={
                  student.enrollments.length
                }
                headings={[
                  { title: "Course" },
                  { title: "Enrollment Date" },
                  { title: "Status" },
                  { title: "Update Status" },
                ]}
                selectable={false}
              >
                {rows}
              </IndexTable>
            )}

          </Card>
        </Layout.Section>

      </Layout>

    </Page>
  );
}