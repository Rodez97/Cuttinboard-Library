## UtensilsContextProps Interface
- `utensils`: An array of `IUtensil` objects representing the utensils data.
- `sortedUtensils`: An array of `IUtensil` objects sorted based on certain criteria.
- `searchQuery`: A string representing the search query for filtering utensils.
- `setSearchQuery`: A function that sets the search query.
- `createUtensil`: A function that creates a new utensil with the provided data.
- `addUtensilChange`: A function that adds a change to a utensil, such as updating its quantity or adding a reason.
- `updateUtensil`: A function that updates a utensil with the provided data.
- `deleteUtensil`: A function that deletes a utensil.
- `error`: An optional `Error` object that represents any error that occurs.
- `loading`: A boolean indicating if the data is currently being loaded or not.

## IUtensilsProvider Interface
- `children`: A `ReactNode` representing the children elements to be wrapped by the provider.

## UtensilsContext
- A context created using `createContext` from React to provide utensils data and functions to other components.

## UtensilsProvider
- A component that serves as the provider for the `UtensilsContext`, which manages the state and actions related to utensils data.

### Props
- `children`: The children elements to be wrapped by the `UtensilsProvider` component.

### State
- `searchQuery`: A state that stores the current search query.
- `loading`: A state that stores the loading status.
- `error`: A state that stores any error object if an error occurs.
- `utensils`: A state that stores the utensils data using a reducer.

### Effects
- `useEffect`: An effect that loads utensils data from Firestore when the component mounts, and unsubscribes from the Firestore subscription when the component unmounts.

### Computed Property
- `sortedUtensils`: A memoized computed property that returns the sorted utensils based on the search query and other criteria.
