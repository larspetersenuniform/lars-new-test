import MainHero from './Hero';
import CallToAction from './CallToAction/CallToAction';
import PersonalizedHero from './PersonalizedHero';
import TalkList from './TalkList/TalkList';
import RegisterForm from './RegisterForm';
import WhyAttend from './WhyAttend';

const componentMap = {
  hero: MainHero,
  cta: CallToAction,
  // that's 'personalized hero' to you, sir.
  '3zPkEj1KqeSn4QdsdnNKO3': PersonalizedHero,
  talksList: TalkList,
  registrationForm: RegisterForm,
  whyAttend: WhyAttend,
};

export function componentResolver(variantType) {
  const component = componentMap[variantType];
  if (!component) {
    // eslint-disable-next-line no-console
    console.warn(`Component for variantType '${variantType}' could not be resolved.`);
  }
  return component;
}
