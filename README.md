# Event Invitation & Poster Generator

A client-side web app for creating personalized event invitation and poster images.

The application is designed to simplify welcoming and inviting people to events by allowing the organizer to define the common event information once, then personalize the invitation for individual guests. It works in a similar way to a simple **mail-merge system**: one poster template is combined with a list of invitees to produce separate personalized posters.

The project is being created with **residents of Kiboswa, Nandi County, Kenya** in mind, with practical community events and local activities as the primary use case.

No backend, no build step — just the **HTML**, **CSS** and JavaScript files required to run the application directly in a browser.

## Deploy to GitHub Pages

## Create a new GitHub repo and add `index.html`, `style.css`, `script.js` (and `assets/` if you use it) to the root.

## Push to GitHub. ## In the repo: **Settings → Pages → Deploy from a branch → main / (root)**. ## Your generator will be live at `[https://<username>.github.io/<repo>/`.](https://<username>.github.io/<repo>/`.)

## Using it

### Event details

The poster is based around a set of common event details, such as:

- Event or purpose
- Venue
- Date
- Supporting information relevant to the event

These details form the common content of the invitation template.

### Invitee

After the event details have been established, an individual invitee can be personalized by:

- Selecting a title
- Entering the invitee's name
- Using a custom title where required

The poster's personalized ***Dear …*** line updates live as the information is entered.

### Participant list

Invitees can be added individually or provided as a list.

- Add names one at a time through the interface.
- Upload a **PDF**, **DOCX**, **XLS** or **XLSX** participant list.
- The application extracts likely name rows/lines automatically.
- Review and correct the imported list before generating the posters.

Legacy binary `.doc` files cannot be parsed directly in the browser; save them as `.docx` first.

### Mail-merge style generation

The application uses the same basic concept as mail merging.

Instead of manually editing the poster for every person, the common event information remains unchanged while the invitee information is inserted automatically.

For example:

```text
Event information
        +
Title + Name
        ↓
Personalized poster
```

For a participant list, the process becomes:

```text
One event template
        +
Multiple invitees
        ↓
One personalized poster per invitee
```

This makes it possible to prepare invitations for many people while maintaining a personalized greeting for each recipient.

### Generate

- **Download **JPG** (current)** — exports the currently displayed personalized poster.
- **Generate & download selected** — renders one **JPG** for each selected participant and downloads them together as a **ZIP**.
- **Generate & download all** — renders a **JPG** for every participant in the list and downloads them together as a **ZIP**.

## Current Example

The current poster demonstrates the application using a **medical-aid appeal for Japhter Rono**.

This is a practical example of the type of community communication the application can support, but Japhter's case is not intended to limit the application to medical-aid appeals.

The same approach can be used for:

- Community events
- Fundraisers
- Medical-aid appeals
- Church activities
- Family gatherings
- Weddings
- Memorial and funeral events
- School events
- Community meetings
- Other local invitations and gatherings

## Privacy and Processing

All processing takes place locally in the user's browser.

**PDF**/Word/Excel parsing, image handling and **JPG** generation are performed client-side using:

- `pdf.js`
- `mammoth.js`
- `SheetJS`
- `html2canvas`
- `JSZip`

Participant information and uploaded files do not need to be sent to a backend server for the application's core workflow.

This makes the application suitable for deployment on static hosting services such as GitHub Pages.

## Technical Structure

The application consists primarily of:

```text index.html     → page structure and poster template style.css      → layout, responsive design and visual styling script.js      → personalization, list processing and poster generation assets/        → optional supporting/reference images ```

There is no server-side application or build process required.

## Notes

- The current implementation contains event-specific information for the Japhter Rono medical-aid poster. These details are currently defined in `index.html` and can be changed directly in the **HTML** when adapting the application to another event.
- The poster design uses the approved blue/white visual palette defined through the `:root` variables in `style.css`.
- The application is designed to keep the common event information separate from the invitee-specific information, making the poster template reusable for different people and events.
- Automatic extraction from uploaded participant lists is not perfect. Imported names should always be reviewed before generating the final posters.

## Project Purpose

The broader purpose of the project is to make personalized event invitations easier to produce for individuals and community organizers.

Instead of repeatedly designing or editing individual posters, an organizer should be able to:

**Specify the event → specify the venue and date → add or upload invitees → generate personalized invitations.**

The project is being developed with the residents and community activities of **Kiboswa, Nandi County, Kenya** as an initial practical context.
