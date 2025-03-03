
import { PassDetails } from "@/components/passes/PassDetails";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

const PassDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  
  useEffect(() => {
    // Log the passId when the component mounts
    console.log("PassDetailsPage mounted with ID:", id);
  }, [id]);

  // Directly pass the ID from the URL params to the PassDetails component
  return <PassDetails />;
};

export default PassDetailsPage;
