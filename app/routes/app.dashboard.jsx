// import { useLoaderData, useNavigate } from "react-router";

// import {
//   Page,
//   Layout,
//   Card,
//   Text,
//   Badge,
//   IndexTable,
//   InlineGrid,
//   BlockStack,
//   Button,
// } from "@shopify/polaris";

// import { authenticate } from "../shopify.server";
// import db from "../db.server";

// /* =========================
//    LOADER
//    ========================= */

// export const loader = async ({ request }) => {
//   // Authenticate Shopify merchant
//   const { session, admin } = await authenticate.admin(request);

//   const shop = session.shop;

//   /* =========================
//      SHOPIFY ADMIN GRAPHQL API
//      ========================= */

//   const response = await admin.graphql(`
//     #graphql
//     query GetShopInfo {
//       shop {
//         name
//         myshopifyDomain
//         email
//         currencyCode
//       }
//     }
//   `);

//   const shopResponse = await response.json();

//   if (shopResponse.errors || !shopResponse.data?.shop) {
//     console.error("Shopify GraphQL error:", shopResponse.errors);

//     throw new Response("Unable to retrieve Shopify store information", {
//       status: 500,
//     });
//   }

//   const shopInfo = shopResponse.data.shop;

//   /* =========================
//      TOTAL COURSES
//      ========================= */

//   const totalCourses = await db.course.count({
//     where: {
//       shop,
//     },
//   });

//   /* =========================
//      TOTAL STUDENTS
//      ========================= */

//   const totalStudents = await db.student.count({
//     where: {
//       shop,
//     },
//   });

//   /* =========================
//      TOTAL ENROLLMENTS
//      ========================= */

//   const totalEnrollments = await db.enrollment.count({
//     where: {
//       shop,
//     },
//   });

//   /* =========================
//      COMPLETED ENROLLMENTS
//      ========================= */

//   const completedEnrollments = await db.enrollment.count({
//     where: {
//       shop,
//       status: "COMPLETED",
//     },
//   });

//   /* =========================
//      IN PROGRESS ENROLLMENTS
//      ========================= */

//   const inProgressEnrollments = await db.enrollment.count({
//     where: {
//       shop,
//       status: "IN_PROGRESS",
//     },
//   });

//   /* =========================
//      RECENTLY ENROLLED STUDENTS
//      ========================= */

//   const recentEnrollments = await db.enrollment.findMany({
//     where: {
//       shop,
//     },

//     include: {
//       student: true,
//       course: true,
//     },

//     orderBy: {
//       enrollmentDate: "desc",
//     },

//     take: 10,
//   });

//   return {
//     totalCourses,
//     totalStudents,
//     totalEnrollments,
//     completedEnrollments,
//     inProgressEnrollments,
//     recentEnrollments,

//     // Shopify Admin API data
//     shopInfo,
//   };
// };

// /* =========================
//    COMPONENT
//    ========================= */

// export default function DashboardPage() {
//   const {
//     totalCourses,
//     totalStudents,
//     totalEnrollments,
//     completedEnrollments,
//     inProgressEnrollments,
//     recentEnrollments,

//     // Shopify store information
//     shopInfo,
//   } = useLoaderData();

//   const navigate = useNavigate();

//   return (
//     <Page title="Student Dashboard">
//       <Layout>
//         {/* =========================
//             SHOPIFY STORE INFORMATION
//             ========================= */}

//         <Layout.Section>
//           <Card>
//             <BlockStack gap="300">
//               <Text variant="headingMd" as="h2">
//                 Shopify Store Information
//               </Text>

//               <Text as="p">
//                 <strong>Store Name:</strong> {shopInfo.name}
//               </Text>

//               <Text as="p">
//                 <strong>Shop Domain:</strong> {shopInfo.myshopifyDomain}
//               </Text>

//               <Text as="p">
//                 <strong>Email:</strong> {shopInfo.email}
//               </Text>

//               <Text as="p">
//                 <strong>Currency:</strong> {shopInfo.currencyCode}
//               </Text>
//             </BlockStack>
//           </Card>
//         </Layout.Section>

//         {/* =========================
//             SUMMARY CARDS
//             ========================= */}

//         <Layout.Section>
//           <InlineGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="400">
//             {/* TOTAL COURSES */}

//             <Card>
//               <BlockStack gap="200">
//                 <Text variant="headingMd" as="h2">
//                   Total Courses
//                 </Text>

//                 <Text variant="heading2xl" as="p">
//                   {totalCourses}
//                 </Text>
//               </BlockStack>
//             </Card>

//             {/* TOTAL STUDENTS */}

//             <Card>
//               <BlockStack gap="200">
//                 <Text variant="headingMd" as="h2">
//                   Total Students
//                 </Text>

//                 <Text variant="heading2xl" as="p">
//                   {totalStudents}
//                 </Text>
//               </BlockStack>
//             </Card>

//             {/* TOTAL ENROLLMENTS */}

//             <Card>
//               <BlockStack gap="200">
//                 <Text variant="headingMd" as="h2">
//                   Total Enrollments
//                 </Text>

//                 <Text variant="heading2xl" as="p">
//                   {totalEnrollments}
//                 </Text>
//               </BlockStack>
//             </Card>

//             {/* COMPLETED */}

//             <Card>
//               <BlockStack gap="200">
//                 <Text variant="headingMd" as="h2">
//                   Completed Enrollments
//                 </Text>

//                 <Text variant="heading2xl" as="p">
//                   {completedEnrollments}
//                 </Text>
//               </BlockStack>
//             </Card>

//             {/* IN PROGRESS */}

//             <Card>
//               <BlockStack gap="200">
//                 <Text variant="headingMd" as="h2">
//                   In Progress
//                 </Text>

//                 <Text variant="heading2xl" as="p">
//                   {inProgressEnrollments}
//                 </Text>
//               </BlockStack>
//             </Card>
//           </InlineGrid>
//         </Layout.Section>

//         {/* =========================
//             RECENT ENROLLMENTS
//             ========================= */}

//         <Layout.Section>
//           <Card padding="0">
//             <div style={{ padding: "16px" }}>
//               <Text variant="headingMd" as="h2">
//                 Recently Enrolled Students
//               </Text>
//             </div>

//             {recentEnrollments.length === 0 ? (
//               <div style={{ padding: "16px" }}>
//                 <Text as="p">No enrollments yet.</Text>
//               </div>
//             ) : (
//               <IndexTable
//                 resourceName={{
//                   singular: "enrollment",
//                   plural: "enrollments",
//                 }}

//                 itemCount={recentEnrollments.length}

//                 headings={[
//                   { title: "Student" },
//                   { title: "Email" },
//                   { title: "Course" },
//                   { title: "Enrollment Date" },
//                   { title: "Status" },
//                 ]}

//                 selectable={false}
//               >
//                 {recentEnrollments.map((enrollment, index) => (
//                   <IndexTable.Row
//                     id={String(enrollment.id)}
//                     key={enrollment.id}
//                     position={index}
//                   >
//                     {/* STUDENT */}

//                     <IndexTable.Cell>
//                       <Button
//                         onClick={() =>
//                           navigate(`/app/students/${enrollment.student.id}`)
//                         }
//                       >
//                         {enrollment.student.name}
//                       </Button>
//                     </IndexTable.Cell>

//                     {/* EMAIL */}

//                     <IndexTable.Cell>
//                       {enrollment.student.email}
//                     </IndexTable.Cell>

//                     {/* COURSE */}

//                     <IndexTable.Cell>{enrollment.course.title}</IndexTable.Cell>

//                     {/* ENROLLMENT DATE */}

//                     <IndexTable.Cell>
//                       {new Date(enrollment.enrollmentDate).toLocaleDateString()}
//                     </IndexTable.Cell>

//                     {/* STATUS */}

//                     <IndexTable.Cell>
//                       <Badge
//                         tone={
//                           enrollment.status === "COMPLETED"
//                             ? "success"
//                             : "attention"
//                         }
//                       >
//                         {enrollment.status === "COMPLETED"
//                           ? "Completed"
//                           : "In Progress"}
//                       </Badge>
//                     </IndexTable.Cell>
//                   </IndexTable.Row>
//                 ))}
//               </IndexTable>
//             )}
//           </Card>
//         </Layout.Section>
//       </Layout>
//     </Page>
//   );
// }