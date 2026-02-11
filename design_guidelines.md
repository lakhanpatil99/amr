# LDPS - Local Delivery Partner Service
## Design Guidelines

### 1. Brand Identity

**Purpose**: On-demand local delivery service connecting users with delivery partners, similar to Uber/Porter.

**Aesthetic Direction**: Professional/Trustworthy - Clean, modern interface with service-oriented reliability. Think Uber-like polish meets local utility. The app should feel fast, dependable, and easy to navigate under time pressure.

**Memorable Element**: Real-time animated order status tracking with clear visual progression (Searching → Assigned → Delivered).

---

### 2. Navigation Architecture

**Root Navigation**: Bottom Tab Navigation (4 tabs)
- Home (booking interface)
- Orders (order history)
- Profile (user account)

**Auth Flow**: Stack-based (Splash → Login → Register → Home)

**Screen List**:
1. Splash Screen - Brand introduction
2. Login Screen - Email/phone authentication
3. Register Screen - New user signup
4. Home Screen - Main booking interface
5. Map Screen - Visual location selection
6. Pickup & Drop Screen - Address confirmation
7. Order Summary Screen - Booking confirmation
8. Order Status Screen - Live tracking simulation
9. Profile Screen - User account management

---

### 3. Screen-by-Screen Specifications

**Splash Screen**
- Layout: Centered logo with app name and subtitle
- No header or navigation
- Auto-transitions after 2s animation
- Safe area: Full screen, centered content

**Login Screen**
- Header: None
- Layout: Scrollable form with centered card
- Components: Email/phone input, password input (with eye toggle), primary button, text link to Register
- Safe area: top = insets.top + 40px, bottom = insets.bottom + 24px

**Register Screen**
- Header: Back button (left), title "Create Account"
- Layout: Scrollable form
- Components: Name, phone, email, password, confirm password inputs, primary button
- Submit button: Below form
- Safe area: top = headerHeight + 16px, bottom = insets.bottom + 24px

**Home Screen**
- Header: Transparent, app logo (left), notification icon (right)
- Layout: Scrollable content
- Components:
  - Pickup location input (with location icon)
  - Drop location input (with pin icon)
  - "Book Delivery" primary button
  - Offers banner (horizontal scrollable cards)
  - Recent orders list (3-4 cards max, "View All" link)
- Bottom tab bar: Home, Orders, Profile
- Safe area: top = headerHeight + 16px, bottom = tabBarHeight + 16px

**Map Screen**
- Header: Back button (left), "Select Location" title
- Layout: Full-screen map with overlay controls
- Components:
  - Google Maps widget (full screen)
  - Current location button (floating, bottom-right)
  - Zoom controls (floating, right edge)
  - Pickup marker (red pin)
  - Drop marker (green pin)
  - Confirm button (floating bottom card)
- Safe area: Floating elements = 16px from edges

**Pickup & Drop Screen**
- Header: Back button (left), "Confirm Locations"
- Layout: Scrollable form with summary card
- Components:
  - Pickup address card (with edit icon)
  - Drop address card (with edit icon)
  - Distance display (large number + "km")
  - Estimated price (bold, prominent)
  - "Confirm Order" primary button
- Safe area: top = headerHeight + 16px, bottom = insets.bottom + 24px

**Order Summary Screen**
- Header: Close button (left), "Order Summary"
- Layout: Scrollable content
- Components:
  - Order details card (pickup, drop, distance, price)
  - Payment method selector (dummy)
  - "Place Order" primary button
- Safe area: top = headerHeight + 16px, bottom = insets.bottom + 24px

**Order Status Screen**
- Header: Back button (left), "Track Order"
- Layout: Scrollable with status card
- Components:
  - Order ID (small text at top)
  - Animated stepper (3 stages: Searching → Assigned → Delivered)
  - Status message (changes with animation)
  - Mini map (static image placeholder)
  - Delivery partner card (avatar, name, rating - appears on "Assigned")
  - Cancel order button (text link, bottom)
- Safe area: top = headerHeight + 16px, bottom = insets.bottom + 24px

**Profile Screen**
- Header: Title "Profile", edit icon (right)
- Layout: Scrollable list
- Components:
  - User avatar (centered, circular)
  - Name, phone, email (card sections)
  - Total orders stat (bold number)
  - Settings list items
  - Logout button (red text, bottom)
- Bottom tab bar
- Safe area: top = headerHeight + 16px, bottom = tabBarHeight + 24px

---

### 4. Color Palette

**Primary**: #2563EB (Trustworthy blue, for CTAs and active states)  
**Primary Dark**: #1E40AF  
**Background**: #F8FAFC (Soft light gray)  
**Surface**: #FFFFFF  
**Text Primary**: #1E293B  
**Text Secondary**: #64748B  
**Border**: #E2E8F0  
**Success**: #10B981 (For drop markers, delivered status)  
**Warning**: #F59E0B (For searching status)  
**Error**: #EF4444  
**Pickup Marker**: #EF4444 (Red for pickup)

---

### 5. Typography

**Font**: System default (Roboto on Android, SF Pro on iOS)

**Type Scale**:
- Headline: 28px, Bold
- Title: 20px, SemiBold
- Subtitle: 16px, Medium
- Body: 14px, Regular
- Caption: 12px, Regular
- Button: 16px, SemiBold

---

### 6. Assets to Generate

**icon.png** - App icon featuring stylized "LDPS" letters or delivery box icon, blue gradient background  
*WHERE USED*: Device home screen

**splash-icon.png** - Same as app icon but larger, for splash screen center  
*WHERE USED*: Splash screen

**empty-orders.png** - Illustration of empty box or clipboard  
*WHERE USED*: Orders tab when user has no order history

**map-placeholder.png** - Static mini map screenshot with pin  
*WHERE USED*: Order status screen (if live map isn't shown)

**offers-banner-1.png** - Promotional banner for "Free delivery on first order"  
*WHERE USED*: Home screen offers section

**offers-banner-2.png** - Promotional banner for "20% off weekend deliveries"  
*WHERE USED*: Home screen offers section

**avatar-placeholder.png** - Generic user avatar (circular)  
*WHERE USED*: Profile screen, delivery partner card