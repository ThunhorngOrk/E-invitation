<script setup>
import HeroSection from './HeroSection.vue'
import InviteSection from './InviteSection.vue'
import CoupleSection from './CoupleSection.vue'
import CountdownSection from './CountdownSection.vue'
import ScheduleSection from './ScheduleSection.vue'
import GallerySection from './GallerySection.vue'
import VenueSection from './VenueSection.vue'
import RsvpSection from './RsvpSection.vue'
import FooterSection from './FooterSection.vue'
import MusicToggle from './MusicToggle.vue'
</script>

<template>
  <div class="invitation-view">
    <HeroSection />

    <main>
      <InviteSection v-reveal />
      <CoupleSection v-reveal />
      <CountdownSection />
      <ScheduleSection />
      <GallerySection />
      <VenueSection v-reveal />
      <RsvpSection v-reveal />
    </main>

    <FooterSection />
    <MusicToggle />
  </div>
</template>

<style scoped>
.invitation-view {
  position: relative;
}
</style>
