import { useLoaderData, useNavigate } from "react-router";

import {
  Page,
  Layout,
  Card,
  IndexTable,
  Button,
  EmptyState,
  Text,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import db from "../db.server";


export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const students = await db.student.findMany({
    where: {
      shop: session.shop,
    },
    include: {
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    students,
  };
};


export default function StudentsPage() {
  const { students } = useLoaderData();

  const navigate = useNavigate();

  if (students.length === 0) {
    return (
      <Page
        title="Students"
        primaryAction={{
          content: "Add student",
          onAction: () => navigate("/app/addstudents"),
        }}
      >
        <Card>
          <EmptyState
            heading="No students yet"
            action={{
              content: "Add student",
              onAction: () =>
                navigate("/app/addstudents"),
            }}
          >
            <p>
              Add your first student to start enrollment.
            </p>
          </EmptyState>
        </Card>
      </Page>
    );
  }

  const rows = students.map((student, index) => (
    <IndexTable.Row
      id={String(student.id)}
      key={student.id}
      position={index}
    >
      <IndexTable.Cell>
        {student.name}
      </IndexTable.Cell>

      <IndexTable.Cell>
        {student.email}
      </IndexTable.Cell>

      <IndexTable.Cell>
        {student._count.enrollments}
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Button
          onClick={() =>
            navigate(`/app/Individualstudent/${student.id}`)
          }
        >
          View
        </Button>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page
      title="Students"
      primaryAction={{
        content: "Add student",
        onAction: () =>
          navigate("/app/addstudents"),
      }}
      secondaryActions={[
        {
          content: "Enroll student",
          onAction: () =>
            navigate("/app/enrollments/new"),
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <Card padding="0">
            <IndexTable
              resourceName={{
                singular: "student",
                plural: "students",
              }}
              itemCount={students.length}
              headings={[
                { title: "Name" },
                { title: "Email" },
                { title: "Enrollments" },
                { title: "" },
              ]}
              selectable={false}
            >
              {rows}
            </IndexTable>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}