const RegistrationStage = ({ stage, currentStage, children }) => {
  let class_name;

  if (currentStage == stage) {
    class_name = 'form-block';
  }
  if (currentStage < stage && stage != 1) {
    class_name = 'form-block slide-in-right';
  }
  if (currentStage > stage) {
    class_name = 'form-block slide-in-left';
  }

  return <div className={class_name}>{children}</div>;
};

export default RegistrationStage;
