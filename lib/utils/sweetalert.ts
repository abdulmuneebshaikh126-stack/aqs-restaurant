import Swal, { SweetAlertOptions } from 'sweetalert2'

const customSwal = Swal.mixin({
  background: '#141418',
  color: '#F5F5F7',
  confirmButtonColor: '#C5A059',
  cancelButtonColor: '#27272a',
  customClass: {
    popup: 'border border-[#C5A059]/40 rounded-2xl shadow-2xl backdrop-blur-md',
    title: 'font-serif text-white tracking-wide',
    confirmButton: 'font-semibold rounded-full px-6 py-2.5 text-black gold-gradient-bg shadow-lg',
    cancelButton: 'font-semibold rounded-full px-6 py-2.5 text-gray-300 hover:text-white',
  },
  buttonsStyling: true,
})

export default customSwal

/**
 * Show a success modal
 */
export const showSuccessAlert = (title: string, text?: string) => {
  return customSwal.fire({
    icon: 'success',
    title,
    text,
    iconColor: '#C5A059',
    timer: 3000,
    timerProgressBar: true,
  })
}

/**
 * Show an error modal
 */
export const showErrorAlert = (title: string, text?: string) => {
  return customSwal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'Understood',
  })
}

/**
 * Show a confirmation modal before an action
 */
export const showConfirmAlert = async (
  title: string,
  text: string,
  confirmButtonText = 'Yes, Proceed'
) => {
  const result = await customSwal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Cancel',
    iconColor: '#E5C158',
    reverseButtons: true,
  })
  return result.isConfirmed
}
