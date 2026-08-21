import { useState,useEffect } from "react";
import { useNavigate, useNavigation, Form, useActionData } from "react-router";
import {
  Page,
  Card,
  FormLayout,
  TextField,
  Select,
  Button,
  Banner,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const instructor = formData.get("instructor")?.toString().trim();
  const category = formData.get("category")?.toString().trim();
  const durationValue = formData.get("duration")?.toString().trim();
  const durationUnit = formData.get("durationUnit")?.toString() || "WEEKS";
  const status = formData.get("status")?.toString() || "ACTIVE";

  const errors = {};
  if (!title) {
    errors.title = "Course title is required";
  }
  if (!description) {
    errors.description = "Description is required";
  }
  
  if (!instructor) {
errors.instructor = "Instructor name is required";
  }
  
  if (!category) {
errors.category = "Category is required";
  }

  const duration = Number(durationValue);
  if (!durationValue) {
errors.duration = "Duration is required";
  }
  else if (!Number.isInteger(duration) || duration <= 0) {
      errors.duration = "Duration must be a positive whole number";
    }

     if (!["HOURS","DAYS","WEEKS","MONTHS"].includes(durationUnit)) {
    errors.durationUnit = "Invalid duration unit";
  }

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
    errors.status = "Invalid course status";
  }
  
  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  try {
    await db.course.create({
      data: {
        shop: session.shop,
        title,
        description,
        instructor,
        category,
        duration,
        durationUnit,
        status,
      },
    });
  } catch (error) {
    console.error("Create course error:", error);
    return {
      errors: {
        form: "Something went wrong saving the course. Please try again.",
      },
    };
  }

  return { success: true };
};

export default function NewCoursePage(){
  const navigate = useNavigate();

  const navigation = useNavigation();

  const actionData = useActionData();

  const isSubmitting =
    navigation.state === "submitting";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructor, setInstructor] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [durationUnit, setDurationUnit] = useState("WEEKS");
  const [status, setStatus] = useState("ACTIVE");

  useEffect(() => {
    if (actionData?.success) {
      navigate("/app/courses");
    }
  }, [actionData, navigate]);

  return (
    <>
    <Page
      title="Create Course"
      backAction={{
        content: "Courses",
        onAction: () => navigate("/app/courses"),
      }}
    >
      <Card>
        {actionData?.errors?.form && (
          <Banner
            tone="critical"
            title="Unable to create course"
          >
            {actionData.errors.form}
          </Banner>
        )}
        <Form method="post">
          <FormLayout>
            <TextField
              label="Course Title"
              name="title"
              value={title}
              onChange={setTitle}
              autoComplete="off"
              error={actionData?.errors?.title}
              requiredIndicator
            />
            <TextField
              label="Description"
              name="description"
              value={description}
              onChange={setDescription}
              multiline={4}
              autoComplete="off"
              error={actionData?.errors?.description}
              requiredIndicator
            />
            <TextField
              label="Instructor Name"
              name="instructor"
              value={instructor}
              onChange={setInstructor}
              autoComplete="off"
              error={actionData?.errors?.instructor}
              requiredIndicator
            />
            <TextField
              label="Category"
              name="category"
              value={category}
              onChange={setCategory}
              autoComplete="off"
              error={actionData?.errors?.category}
              requiredIndicator
            />
            <TextField
              label="Duration"
              name="duration"
              type="number"
              value={duration}
              onChange={setDuration}
              placeholder="e.g. 6"
              min={1}
              autoComplete="off"
              error={actionData?.errors?.duration}
              requiredIndicator
            />
            <Select
              label="Duration Unit"
              name="durationUnit"
              value={durationUnit}
              onChange={setDurationUnit}
              options={[
                {
      label: "Hours",
      value: "HOURS",
    },
                {
                  label: "Days",
                  value: "DAYS",
                },
                {
                  label: "Weeks",
                  value: "WEEKS",
                },
                {
                  label: "Months",
                  value: "MONTHS",
                },
              ]}
              error={actionData?.errors?.durationUnit}
            />
            <Select
              label="Course Status"
              name="status"
              value={status}
              onChange={setStatus}
              options={[
                {
                  label: "Active",
                  value: "ACTIVE",
                },
                {
                  label: "Inactive",
                  value: "INACTIVE",
                },
              ]}
              error={actionData?.errors?.status}
            />
            <Button
              submit
              variant="primary"
              loading={isSubmitting}
            >
              Create Course
            </Button>
          </FormLayout>
        </Form>
      </Card>
    </Page>
    </>
  );
};