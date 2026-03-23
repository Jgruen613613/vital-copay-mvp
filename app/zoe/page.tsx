import ZoeNavbar from '@/components/zoe/ZoeNavbar'
import ZoeHero from '@/components/zoe/ZoeHero'
import ZoeHowItWorks from '@/components/zoe/ZoeHowItWorks'
import ZoeExperience from '@/components/zoe/ZoeExperience'
import ZoeWaitlist from '@/components/zoe/ZoeWaitlist'
import ZoeAbout from '@/components/zoe/ZoeAbout'
import ZoeFooter from '@/components/zoe/ZoeFooter'

export default function ZoeLandingPage() {
  return (
    <>
      <ZoeNavbar />
      <ZoeHero />
      <ZoeHowItWorks />
      <ZoeExperience />
      <ZoeWaitlist />
      <ZoeAbout />
      <ZoeFooter />
    </>
  )
}
