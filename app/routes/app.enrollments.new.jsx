import { useState, useEffect } from "react";
import {
  useLoaderData,
  useActionData,
  useNavigate,
  useNavigation,
  Form,
} from "react-router";

import {
  Page,
  Layout,
  Card,
  Select,
  Button,
  BlockStack,
  Banner,
  Text,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const students = await db.student.findMany({
    where: { shop: session.shop },
    orderBy: { name: "asc" },
  });

  const courses = await db.course.findMany({
    where: { shop: session.shop, status: "ACTIVE" },
    orderBy: { title: "asc" },
  });

  return { students, courses };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const studentId = Number(formData.get("studentId"));
  const courseId = Number(formData.get("courseId"));

  if (!Number.isInteger(studentId) || !Number.isInteger(courseId) || !studentId || !courseId) {
    return { error: "Please select a student and course." };
  }

  const student = await db.student.findFirst({
    where: { id: studentId, shop: session.shop },
  });
  if (!student) {
    return { error: "Student not found." };
  }

  const course = await db.course.findFirst({
    where: { id: courseId, shop: session.shop, status: "ACTIVE" },
  });
  if (!course) {
    return { error: "Course not found or inactive." };
  }

  const existingEnrollment = await db.enrollment.findFirst({
    where: { shop: session.shop, studentId, courseId },
  });
  if (existingEnrollment) {
    return { error: "This student is already enrolled in this course." };
  }

  try {
    await db.enrollment.create({
      data: { shop: session.shop, studentId, courseId, status: "IN_PROGRESS" },
    });
    return { success: true, studentId };
  } catch (err) {
    if (err.code === "P2002") {
      return { error: "This student is already enrolled in this course." };
    }
    return { error: "Something went wrong. Please try again." };
  }
};

export default function NewEnrollmentPage() {
  const { students, courses } = useLoaderData();
  const actionData = useActionData();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");

  useEffect(() => {
    if (actionData?.success) {
      navigate(`/app/students/${actionData.studentId}`);
    }
  }, [actionData, navigate]);

  const studentOptions = [
    { label: "Select student", value: "" },
    ...students.map((student) => ({
      label: `${student.name} (${student.email})`,
      value: String(student.id),
    })),
  ];

  const courseOptions = [
    { label: "Select course", value: "" },
    ...courses.map((course) => ({
      label: course.title,
      value: String(course.id),
    })),
  ];

  return (
    <Page
      title="Enroll Student"
      backAction={{ content: "Students", onAction: () => navigate("/app/students") }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <Form method="post">
              <BlockStack gap="400">
                {actionData?.error && <Banner tone="critical">{actionData.error}</Banner>}
                {students.length === 0 && (
                  <Banner tone="warning">No students available. Please create a student first.</Banner>
                )}
                {courses.length === 0 && (
                  <Banner tone="warning">No active courses available.</Banner>
                )}

                <Select
                  label="Student"
                  name="studentId"
                  options={studentOptions}
                  value={studentId}
                  onChange={setStudentId}
                />

                <Select
                  label="Course"
                  name="courseId"
                  options={courseOptions}
                  value={courseId}
                  onChange={setCourseId}
                />

                <Text as="p">Enrollment status will initially be set to In Progress.</Text>

                <Button
                  submit
                  variant="primary"
                  loading={isSubmitting}
                  disabled={students.length === 0 || courses.length === 0}
                >
                  Enroll Student
                </Button>
              </BlockStack>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}