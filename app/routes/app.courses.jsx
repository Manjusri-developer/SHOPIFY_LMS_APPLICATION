import { useLoaderData, useNavigate } from "react-router";
import {
  Page,
  Layout,
  Card,
  IndexTable,
  Badge,
  Button,
  EmptyState,
} from "@shopify/polaris";
import { DeleteIcon, EditIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const courses = await db.course.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
  });
  return { 
    courses 
};
};

export default function CoursesPage() {
  const { courses } = useLoaderData();
  const navigate = useNavigate();

  if (courses.length === 0) {
    return (
      <Page title="Courses">
        <Card>
          <EmptyState
            heading="No courses yet"
            action={{ content: "Create course", onAction: () => navigate("/app/add_courses") }}
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>Create your first course to get started.</p>
          </EmptyState>
        </Card>
      </Page>
    );
  }

  const rows = courses.map((course, index) => (
    <IndexTable.Row id={course.id} key={course.id} position={index}>
      <IndexTable.Cell>{course.title}</IndexTable.Cell>
      <IndexTable.Cell>{course.instructor}</IndexTable.Cell>
      <IndexTable.Cell>{course.category}</IndexTable.Cell>
      <IndexTable.Cell>{course.duration}{course.durationUnit.toLowerCase()}</IndexTable.Cell>
      <IndexTable.Cell>
        <Badge tone={course.status === "ACTIVE" ? "success" : "critical"}>
          {course.status}
        </Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <div onClick={(e) => e.stopPropagation()}>
<Button onClick={() => {
      console.log("1. Button clicked, course id is:", course.id);
      const targetUrl = `/app/Individualcourse/${course.id}`;
      console.log("2. About to navigate to:", targetUrl);
      navigate(targetUrl);
      console.log("3. navigate() was called");
    }} >View</Button>
        </div>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page
      title="Courses"
      primaryAction={{ content: "Create course", onAction: () => navigate("/app/add_courses") }}
    >
      <Layout>
        <Layout.Section>
          <Card padding="0">
            <IndexTable
              resourceName={{ singular: "course", plural: "courses" }}
              itemCount={courses.length}
              headings={[
                { title: "Title" },
                { title: "Instructor" },
                { title: "Category" },
                { title: "Duration" },
                { title: "Status" },
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