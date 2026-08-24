# Home Services Management App


### Overview
This app is designed for contractors or freelancers that want a centralized application for managing their home services business. 
This app can be scaled towards a number of different services and business sizes but was created primarily for those that run smaller businesses.

The goal in the creation of this application was to make a user-friendly app that allows people to spend less time doing daily busy work for their business so that they can have more time
to grow and scale their business. On initial creation, the developers were gearing this app towards HVAC contractors and freelancers atmpting to cover every aspect of their business for auditing,
control, and overall organization. Lots of people in these fields find themselves overwhelmed by using a large number of tools, scattered data, and it feeling like a full time job just to keep their
business working smoothly. This limits their opportunity for growth as every new job, client, and in cases where people have others working for them, new workers coming and old ones leaving
feels like a mountain of a task weekly and daily.

### App Architecture
The architecture of this application is geared to incorporate and use lots of user-friendly, open-source tools so that future users will spend less time debugging and have access to documentation help.
This app is currently built using a React-Javascript framework for the web-app version, and React-Native for the mobile app version. This makes the front-end side of the application pretty self-explanatory
and easy for scale or changes for anyone using it. The backend of the application is more involved. The developers use Python's FastAPI as a backend for all of the data computations and LLM calls.
THis app does not use AI extensively so the devs have opted to use a local models from Ollama, which makes AI calls completely free (given user has adequate hardware).

===============================================
_Each 'tool' used in this application will have in overview of how it works in ./TOOLS_README.md_
_Database Schema and Supabase Configuration steps can be found in ./DATABASE_README.md_
==============================================

### Demo / Daily use case
User Logs ON --> Views daily relevent info (jobs upcoming, financial details etc.) ---> User needs to manage updates ---> User adds a new job upcoming ---> Database is updated

User needs to update job info ---> User uploads reciept ---> OCR pipeline is triggered ---> User ties receipt data for given job

User needs to mark job as complete ---> User logs in and finds job ---> Changes status to complete ---> Database is updated
Case 1 for above : User sends invoice to the user via email integration (Sensitive notifications are updated)
Case 2 : Job is marked as paid and complete (Sensitive notifications are updated).

### Developer's Remark
The current state of this application is open-source for anyone to use and re-distrubute as needed, the goal for the developers is to make this as accessible as possible for anyone who wishes to use it.
With the growing and evolving state of technology and AI, developers and inquisitives have more access to information and growth than ever before. The developer's of this application and ones similar
do not see this as something to be kept from the general user with a subscription sitting in front of every application and service, but rather something that can be shared so that all people can benefit.
In this case, not just business owners, but their clients as well.

